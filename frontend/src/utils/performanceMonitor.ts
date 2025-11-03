/**
 * Performance monitoring utilities
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'timing' | 'counter' | 'gauge';
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  /**
   * Record a timing metric
   */
  timing(name: string, duration: number): void {
    this.addMetric({
      name,
      value: duration,
      timestamp: Date.now(),
      type: 'timing'
    });
  }

  /**
   * Record a counter metric
   */
  counter(name: string, value: number = 1): void {
    this.addMetric({
      name,
      value,
      timestamp: Date.now(),
      type: 'counter'
    });
  }

  /**
   * Record a gauge metric
   */
  gauge(name: string, value: number): void {
    this.addMetric({
      name,
      value,
      timestamp: Date.now(),
      type: 'gauge'
    });
  }

  /**
   * Measure execution time of a function
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.timing(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.timing(`${name}_error`, duration);
      this.counter(`${name}_errors`);
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  measureSync<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.timing(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.timing(`${name}_error`, duration);
      this.counter(`${name}_errors`);
      throw error;
    }
  }

  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals(): Promise<{
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
    TTFB?: number;
  }> {
    return new Promise((resolve) => {
      const vitals: any = {};

      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries[entries.length - 1];
        vitals.FCP = fcp.startTime;
        fcpObserver.disconnect();
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1];
        vitals.LCP = lcp.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fid = entries[0] as any; // Type assertion for FID entry
        vitals.FID = fid.processingStart - fid.startTime;
        fidObserver.disconnect();
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        vitals.CLS = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Time to First Byte
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0] as PerformanceNavigationTiming;
        vitals.TTFB = nav.responseStart - nav.requestStart;
      }

      // Return vitals after a short delay to collect metrics
      setTimeout(() => {
        lcpObserver.disconnect();
        clsObserver.disconnect();
        resolve(vitals);
      }, 3000);
    });
  }

  /**
   * Monitor resource loading performance
   */
  monitorResources(): void {
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        
        // Record resource loading time
        this.timing(`resource_${this.getResourceType(resource.name)}`, resource.duration);
        
        // Record resource size if available
        if (resource.transferSize) {
          this.gauge(`resource_size_${this.getResourceType(resource.name)}`, resource.transferSize);
        }
      }
    });
    
    resourceObserver.observe({ entryTypes: ['resource'] });
  }

  /**
   * Monitor memory usage
   */
  monitorMemory(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.gauge('memory_used', memory.usedJSHeapSize);
      this.gauge('memory_total', memory.totalJSHeapSize);
      this.gauge('memory_limit', memory.jsHeapSizeLimit);
    }
  }

  /**
   * Monitor network information
   */
  monitorNetwork(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.gauge('network_downlink', connection.downlink);
      this.gauge('network_rtt', connection.rtt);
      this.counter(`network_type_${connection.effectiveType}`);
    }
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    timings: { [key: string]: { avg: number; min: number; max: number; count: number } };
    counters: { [key: string]: number };
    gauges: { [key: string]: number };
  } {
    const timings: any = {};
    const counters: any = {};
    const gauges: any = {};

    for (const metric of this.metrics) {
      if (metric.type === 'timing') {
        if (!timings[metric.name]) {
          timings[metric.name] = { values: [], count: 0 };
        }
        timings[metric.name].values.push(metric.value);
        timings[metric.name].count++;
      } else if (metric.type === 'counter') {
        counters[metric.name] = (counters[metric.name] || 0) + metric.value;
      } else if (metric.type === 'gauge') {
        gauges[metric.name] = metric.value;
      }
    }

    // Calculate timing statistics
    for (const name in timings) {
      const values = timings[name].values;
      timings[name] = {
        avg: values.reduce((a: number, b: number) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
    }

    return { timings, counters, gauges };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Export metrics for external monitoring
   */
  export(): PerformanceMetric[] {
    return [...this.metrics];
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.monitorResources();
  
  // Monitor memory and network periodically
  setInterval(() => {
    performanceMonitor.monitorMemory();
    performanceMonitor.monitorNetwork();
  }, 30000); // Every 30 seconds
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  return {
    timing: performanceMonitor.timing.bind(performanceMonitor),
    counter: performanceMonitor.counter.bind(performanceMonitor),
    gauge: performanceMonitor.gauge.bind(performanceMonitor),
    measure: performanceMonitor.measure.bind(performanceMonitor),
    measureSync: performanceMonitor.measureSync.bind(performanceMonitor),
    getSummary: performanceMonitor.getSummary.bind(performanceMonitor),
    getCoreWebVitals: performanceMonitor.getCoreWebVitals.bind(performanceMonitor)
  };
}