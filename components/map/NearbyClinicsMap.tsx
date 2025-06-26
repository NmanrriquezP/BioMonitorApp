
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GeoCoordinates } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { AlertCircle, Hospital, MapPin as UserLocationIconLucide } from 'lucide-react'; // Renamed to avoid confusion if used as component
import { COLORS } from '../../constants';


// Updated Google Maps API TypeScript Declarations
declare global {
  interface Window {
    google: typeof google;
    googleMapsApiLoaded?: boolean; // Added for checking API load status
    initMapBioMonitor?: () => void; // Callback function for Maps API script
  }

  namespace google.maps {
    // LatLng & LatLngLiteral (already mostly fine, ensure it's available)
    interface LatLngLiteral { lat: number; lng: number; }
    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      constructor(literal: LatLngLiteral, noWrap?: boolean);
      equals(other: LatLng | null): boolean;
      lat(): number;
      lng(): number;
      toJSON(): LatLngLiteral;
      toString(): string;
      toUrlValue(precision?: number): string;
    }

    // Map & MapOptions
    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapId?: string; // For vector maps / cloud-based map styling
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      // ... other options
    }
    class Map {
      constructor(mapDiv: HTMLElement | null, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      getDiv(): HTMLElement;
      // ... other methods
    }

    // InfoWindow & InfoWindowOptions
    interface InfoWindowOptions {
      content?: string | Node;
      position?: LatLng | LatLngLiteral;
      // ... other options
    }
    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map?: Map, anchor?: MVCObject | google.maps.marker.AdvancedMarkerElement): void; // Anchor can be AdvancedMarkerElement
      close(): void;
      getContent(): string | Node | undefined;
      getPosition(): LatLng | undefined;
      setContent(content: string | Node): void;
      setPosition(position: LatLng | LatLngLiteral): void;
      // ... other methods
    }

    // MVCObject (base class for many Maps objects, including markers for InfoWindow anchor)
    class MVCObject {
      addListener(eventName: string, handler: (...args: any[]) => void): MapsEventListener;
    }
    interface MapsEventListener { remove(): void; }


    // AdvancedMarkerElement (namespace google.maps.marker)
    namespace marker {
      interface AdvancedMarkerElementOptions {
        map?: Map;
        position?: LatLng | LatLngLiteral | null;
        content?: Node | null; // For custom HTML content
        title?: string | null;
        gmpDraggable?: boolean;
        zIndex?: number | null;
      }
      class AdvancedMarkerElement extends HTMLElement { // Extends HTMLElement
        constructor(options?: AdvancedMarkerElementOptions);
        addListener(eventName: string, handler: (...args: any[]) => void): MapsEventListener; // Re-declare for AdvancedMarkerElement
        position: LatLng | LatLngLiteral | null;
        map: Map | null;
        title: string | null;
        // ... other properties/methods
      }
    }

    // Places API (google.maps.places.Place class and its static searchNearby)
    namespace places {
      interface PlaceSearchRequest {
        locationRestriction?: LatLngBounds | LatLngBoundsLiteral | Circle; // Optional
        includedTypes: string[]; // e.g., ['hospital', 'clinic', 'doctor']
        language?: string;
        maxResultCount?: number; // 1-20
        rankPreference?: RankPreference; // DISTANCE or RELEVANCE
        region?: string; 
        // For rankPreference: 'DISTANCE', location and includedTypes are required.
        // For rankPreference: 'RELEVANCE' (default), location and radius are required if not using text query.
        // Since we will use user location and types, 'DISTANCE' is good.
        // If using 'DISTANCE', 'radius' is not allowed.
        // For searchNearby with location and types (no query text), radius is needed for relevance ranking.
        // Let's use rankPreference: 'DISTANCE' to simplify.
        // OR use default (RELEVANCE) and provide a radius. Let's try relevance with radius.
        location: LatLng | LatLngLiteral;
        radius: number; // Required if rankPreference is RELEVANCE and no query
      }

      interface Place {
        id?: string;
        displayName?: string;
        formattedAddress?: string;
        location?: LatLng; // Typically LatLng, not LatLngLiteral here
        // ... other properties like openingHours, photos, rating, etc.
      }
      
      interface SearchNearbyResponse {
        places: Place[];
      }

      class Place { // Static methods are on the class itself
        static searchNearby(request: PlaceSearchRequest): Promise<SearchNearbyResponse>;
      }
      
      // Other supporting types if needed for PlaceSearchRequest
      class LatLngBounds { constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral); }
      interface LatLngBoundsLiteral { east: number; north: number; south: number; west: number; }
      class Circle { constructor(center: LatLng | LatLngLiteral, radius: number); }
      enum RankPreference { DISTANCE = "DISTANCE", RELEVANCE = "RELEVANCE" }
    }
  }
}


export const NearbyClinicsMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [userLocation, setUserLocation] = useState<GeoCoordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [apiReady, setApiReady] = useState(window.googleMapsApiLoaded || false);

  const clearMarkers = useCallback(() => {
    markers.forEach(marker => {
      marker.map = null; // Remove from map
    });
    setMarkers([]);
  }, [markers]);

  // Listen for Google Maps API load event
  useEffect(() => {
    if (window.googleMapsApiLoaded) {
      setApiReady(true);
      return;
    }
    const handleApiLoad = () => setApiReady(true);
    window.addEventListener('googleMapsApiLoaded', handleApiLoad);
    return () => window.removeEventListener('googleMapsApiLoaded', handleApiLoad);
  }, []);


  // Geolocation
  useEffect(() => {
    if (!apiReady) return; // Wait for API to be ready

    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newUserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newUserLocation);
          setError(null);
          // setLoading(false); // Defer to map initialization
        },
        (geoError) => {
          console.error("Error getting user location:", geoError);
          setError("No se pudo obtener tu ubicación. Verifica permisos y servicios de localización. Mostrando ubicación de respaldo.");
          setUserLocation({ lat: 20.6597, lng: -103.3496 }); // Guadalajara, MX as fallback
          setLoading(false);
        }
      );
    } else {
      setError("La geolocalización no es soportada. Mostrando ubicación de respaldo.");
      setUserLocation({ lat: 20.6597, lng: -103.3496 }); // Guadalajara, MX as fallback
      setLoading(false);
    }
  }, [apiReady]);

  // Initialize Map and InfoWindow
  useEffect(() => {
    if (!apiReady || !mapRef.current || mapInstance) return; // Ensure API is ready and map not already initialized

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: userLocation || { lat: 20.6597, lng: -103.3496 }, // Use userLocation or fallback
        zoom: 14,
        mapId: 'BIOMONITOR_MAP_ID', // Optional: for cloud-based map styling
        mapTypeControl: false,
        streetViewControl: false,
      });
      setMapInstance(map);

      const iw = new window.google.maps.InfoWindow();
      setInfoWindow(iw);

    } catch (e) {
      console.error("Google Maps API error during map/infowindow initialization:", e);
      setError("Error al inicializar el mapa. Verifica la API Key y la consola.");
      setLoading(false);
    }
  }, [apiReady, userLocation, mapInstance]);


  // Add user marker and search for places
  useEffect(() => {
    if (!mapInstance || !userLocation || !infoWindow) return;

    setLoading(true); // Start loading for search
    clearMarkers(); // Clear previous markers

    // User Marker
    // For simplicity with AdvancedMarkerElement content, we use a simpler DOM element or SVG string
    const userMarkerContent = document.createElement('div');
    // Extracting color name for CSS class; ensure COLORS.primary is like 'bg-turquoise-medium'
    const primaryColorName = COLORS.primary.startsWith('bg-') ? COLORS.primary.substring(3) : 'turquoise-medium';
    userMarkerContent.style.cssText = `width:30px; height:30px; background-color: var(--color-${primaryColorName}, #50C2C9); border-radius:50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center;`;
    userMarkerContent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`; // Simple MapPin SVG

    const userAdvMarker = new window.google.maps.marker.AdvancedMarkerElement({
      map: mapInstance,
      position: userLocation,
      title: "Tu Ubicación",
      content: userMarkerContent,
    });
    setMarkers(prev => [...prev, userAdvMarker]);
    mapInstance.setCenter(userLocation);


    // Search for nearby medical centers
    const searchRequest: google.maps.places.PlaceSearchRequest = {
      location: userLocation,
      radius: 5000, // 5km
      includedTypes: ['hospital', 'clinic', 'doctor'],
      // rankPreference: google.maps.places.RankPreference.RELEVANCE, // Default if radius is provided
      maxResultCount: 15,
    };

    window.google.maps.places.Place.searchNearby(searchRequest)
      .then(({ places }: google.maps.places.SearchNearbyResponse) => {
        if (places && places.length > 0) {
          const newPlaceMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
          places.forEach(place => {
            if (place.location) {
              const hospitalIconContent = document.createElement('div');
               // Extracting color name for CSS class; ensure COLORS.secondary is like 'bg-pink-semi-reddish'
              const secondaryColorName = COLORS.secondary.startsWith('bg-') ? COLORS.secondary.substring(3) : 'pink-semi-reddish';
              hospitalIconContent.style.cssText = `width:28px; height:28px; background-color: var(--color-${secondaryColorName}, #FF6B6B); border-radius:50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center;`;
              hospitalIconContent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>`; // Shield Check SVG

              const marker = new window.google.maps.marker.AdvancedMarkerElement({
                map: mapInstance,
                position: place.location,
                title: place.displayName,
                content: hospitalIconContent,
              });
              marker.addListener('click', () => {
                infoWindow.setContent(`
                  <div style="font-family: sans-serif; padding: 5px;">
                    <h4 style="margin:0 0 5px 0; font-size: 14px; color: ${COLORS.textHeading};">${place.displayName || 'Centro Médico'}</h4>
                    <p style="margin:0; font-size: 12px; color: ${COLORS.textDefault};">${place.formattedAddress || 'Dirección no disponible'}</p>
                  </div>
                `);
                infoWindow.open(mapInstance, marker);
              });
              newPlaceMarkers.push(marker);
            }
          });
          setMarkers(prev => [...prev, ...newPlaceMarkers]);
          setError(null);
        } else {
          setError("No se encontraron centros médicos cercanos.");
        }
        setLoading(false);
      })
      .catch(e => {
        console.error("Places API searchNearby error:", e);
        setError("Error al buscar centros médicos. Verifica la API Key y la consola.");
        setLoading(false);
      });

  }, [mapInstance, userLocation, infoWindow, clearMarkers]);


  if (!apiReady || loading) {
    return <LoadingSpinner text={!apiReady ? "Cargando API de Google Maps..." : "Cargando mapa y ubicación..."} size="lg"/>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center space-x-3">
        <AlertCircle size={30}/>
        <p className="text-sm">{error} Asegúrate de haber reemplazado 'YOUR_GOOGLE_MAPS_API_KEY_PLACEHOLDER' en index.html con una clave válida y habilitada para "Maps JavaScript API" y "Places API".</p>
      </div>
    );
  }
  
  // Define CSS variables for colors from constants.ts to be used in style.cssText
  const colorStyles = `
    :root {
      --color-turquoise-medium: #50C2C9;
      --color-pink-semi-reddish: #FF6B6B;
      /* Add other colors from COLORS if needed by markers */
    }
  `;

  return (
    <>
    <style>{colorStyles}</style>
    <div className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-md border border-gray-300" ref={mapRef}>
      {/* Map is rendered here by Google Maps API */}
    </div>
    </>
  );
};
