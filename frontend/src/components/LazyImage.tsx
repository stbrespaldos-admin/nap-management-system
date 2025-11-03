import React, { useState, useRef, useEffect } from 'react';
import { imageCache } from '../utils/imageOptimization';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number; // Intersection observer threshold
  rootMargin?: string; // Intersection observer root margin
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  style,
  placeholder,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('');

  // Check if image is already cached
  useEffect(() => {
    if (imageCache.has(src)) {
      setImageSrc(imageCache.get(src)!);
      setIsLoaded(true);
      return;
    }
  }, [src]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  // Load image when in view
  useEffect(() => {
    if (isInView && !isLoaded && !hasError && !imageCache.has(src)) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        imageCache.set(src, src);
        onLoad?.();
      };
      
      img.onerror = () => {
        setHasError(true);
        onError?.();
      };
      
      img.src = src;
    }
  }, [isInView, isLoaded, hasError, src, onLoad, onError]);

  const containerStyle: React.CSSProperties = {
    display: 'inline-block',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    ...style
  };

  const imageStyle: React.CSSProperties = {
    width: width || '100%',
    height: height || 'auto',
    transition: 'opacity 0.3s ease',
    opacity: isLoaded ? 1 : 0,
  };

  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
    fontSize: '14px',
    opacity: isLoaded ? 0 : 1,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none'
  };

  const loadingSpinnerStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    border: '2px solid #e5e7eb',
    borderTop: '2px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  return (
    <div style={containerStyle} className={className}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        style={imageStyle}
        width={width}
        height={height}
      />
      
      {!isLoaded && !hasError && (
        <div style={placeholderStyle}>
          {isInView ? (
            <div style={loadingSpinnerStyle} />
          ) : (
            placeholder || '📷'
          )}
        </div>
      )}
      
      {hasError && (
        <div style={placeholderStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
            <div>Error al cargar imagen</div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LazyImage;