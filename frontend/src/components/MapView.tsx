import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { NAP, MapViewProps, MarkerInfo } from '../types/nap';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyDkxqkgM8DEjcMqF4N2-1YTXE8s2PpnjGU';

// Default center for Colombia (approximate center)
const DEFAULT_CENTER = { lat: 4.5709, lng: -74.2973 };
const DEFAULT_ZOOM = 6;

// Status colors for markers
const STATUS_COLORS = {
  pendiente: '#FFA500',      // Orange
  en_construccion: '#FFD700', // Gold
  activo: '#32CD32',         // Lime Green
  validado: '#008000',       // Green
  rechazado: '#FF0000',      // Red
};

const MapView: React.FC<MapViewProps> = ({ naps, onMarkerClick, filterState = 'all' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<MarkerInfo[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter NAPs based on current filter state
  const filteredNaps = filterState === 'all' 
    ? naps 
    : naps.filter(nap => nap.status === filterState);

  // Create custom marker icon
  const createMarkerIcon = useCallback((status: NAP['status']) => {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: STATUS_COLORS[status],
      fillOpacity: 0.8,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 8,
    };
  }, []);

  // Create info window content
  const createInfoWindowContent = useCallback((nap: NAP) => {
    const statusText = {
      pendiente: 'Pendiente',
      en_construccion: 'En Construcción',
      activo: 'Activo',
      validado: 'Validado',
      rechazado: 'Rechazado',
    };

    return `
      <div style="padding: 12px; min-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
          NAP ${nap.id}
        </h3>
        <div style="margin-bottom: 8px;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; color: white; background-color: ${STATUS_COLORS[nap.status]};">
            ${statusText[nap.status]}
          </span>
        </div>
        <div style="color: #6b7280; font-size: 14px; line-height: 1.4;">
          <div style="margin-bottom: 4px;">
            <strong>Municipio:</strong> ${nap.municipality}
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Sector:</strong> ${nap.sector}
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Registrado por:</strong> ${nap.registeredBy}
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Fecha:</strong> ${nap.registrationDate.toLocaleDateString('es-CO')}
          </div>
          ${nap.observations ? `
            <div style="margin-bottom: 8px;">
              <strong>Observaciones:</strong><br>
              <span style="font-style: italic;">${nap.observations}</span>
            </div>
          ` : ''}
        </div>
        <button 
          onclick="window.handleMarkerClick('${nap.id}')"
          style="
            background: #3b82f6; 
            color: white; 
            border: none; 
            padding: 6px 12px; 
            border-radius: 6px; 
            font-size: 12px; 
            cursor: pointer;
            margin-top: 8px;
          "
        >
          Ver Detalles
        </button>
      </div>
    `;
  }, []);

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(({ marker }) => {
      marker.setMap(null);
    });
    markersRef.current = [];
  }, []);

  // Create markers for NAPs
  const createMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return;

    clearMarkers();

    filteredNaps.forEach(nap => {
      const marker = new google.maps.Marker({
        position: { lat: nap.coordinates.latitude, lng: nap.coordinates.longitude },
        map: mapInstanceRef.current,
        title: `NAP ${nap.id} - ${nap.municipality}`,
        icon: createMarkerIcon(nap.status),
      });

      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }

        infoWindowRef.current = new google.maps.InfoWindow({
          content: createInfoWindowContent(nap),
        });

        infoWindowRef.current.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push({ nap, marker });
    });

    // Adjust map bounds to fit all markers
    if (filteredNaps.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      filteredNaps.forEach(nap => {
        bounds.extend({ lat: nap.coordinates.latitude, lng: nap.coordinates.longitude });
      });
      mapInstanceRef.current.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
        if (mapInstanceRef.current!.getZoom()! > 15) {
          mapInstanceRef.current!.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [filteredNaps, createMarkerIcon, createInfoWindowContent, clearMarkers]);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      if (!GOOGLE_MAPS_API_KEY) {
        setError('Google Maps API key is not configured');
        setIsLoading(false);
        return;
      }

      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();

        if (mapRef.current) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          });

          // Set up global handler for info window buttons
          (window as any).handleMarkerClick = (napId: string) => {
            const nap = naps.find(n => n.id === napId);
            if (nap) {
              onMarkerClick(nap);
            }
          };

          setIsLoading(false);
        }
      } catch (err) {
        setError('Failed to load Google Maps');
        setIsLoading(false);
        console.error('Error loading Google Maps:', err);
      }
    };

    initMap();

    // Cleanup
    return () => {
      clearMarkers();
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
      // Clean up global handler
      delete (window as any).handleMarkerClick;
    };
  }, []);

  // Update markers when NAPs or filter changes
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      createMarkers();
    }
  }, [createMarkers, isLoading]);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        background: '#f8f9fa',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        color: '#dc3545',
        fontSize: '16px',
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(248, 249, 250, 0.9)',
          zIndex: 1000,
          fontSize: '16px',
          color: '#6b7280',
        }}>
          Cargando mapa...
        </div>
      )}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          borderRadius: '8px',
          border: '1px solid #e1e5e9',
        }}
      />
    </div>
  );
};

export default MapView;