
import React, { useEffect, useRef, useState, useCallback } from 'react';
import L, { LatLngExpression, Marker as LeafletMarker, Icon } from 'leaflet'; // Import Icon
import { GeoCoordinates } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { AlertCircle, Search, LocateFixed, HospitalIcon } from 'lucide-react'; 
import { COLORS } from '../../constants';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

// Nominatim API result structure (simplified)
interface NominatimPlace {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  extratags?: {
    amenity?: string;
    healthcare?: string;
  };
}

// Default Leaflet icon fix
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom User Location Icon
const userIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'user-location-marker'
});

// Custom Medical Center Icon
const medicalIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${COLORS.pinkSemiReddish.replace('#','')}" width="28px" height="28px" style="background:white; border-radius:50%; padding:3px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>`;
const medicalIcon = new L.DivIcon({
  html: medicalIconSVG,
  className: 'medical-center-div-icon',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});


export const LeafletMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<LeafletMarker | null>(null);
  const placeMarkersRef = useRef<LeafletMarker[]>([]);

  const [userLocation, setUserLocation] = useState<GeoCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('hospital');
  const [searchCity, setSearchCity] = useState<string>('La Paz');

  const BOLIVIA_CENTER: LatLngExpression = [-16.5, -64.0];
  const DEFAULT_ZOOM = 5; // Zoom out a bit more for Bolivia overview
  const CITY_ZOOM = 12;
  const USER_LOCATED_ZOOM = 14;

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView(BOLIVIA_CENTER, DEFAULT_ZOOM);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleGeolocate = useCallback(() => {
    setLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newUserLoc: GeoCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newUserLoc);
          if (mapRef.current) {
            mapRef.current.setView([newUserLoc.lat, newUserLoc.lng], USER_LOCATED_ZOOM);
            if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([newUserLoc.lat, newUserLoc.lng]);
            } else {
              userMarkerRef.current = L.marker([newUserLoc.lat, newUserLoc.lng], { icon: userIcon })
                .addTo(mapRef.current)
                .bindPopup("Tu ubicación actual")
                .openPopup();
            }
          }
          setLoading(false);
          performSearch(searchTerm || "centro médico", newUserLoc); // Search near user after locating
        },
        (geoError) => {
          console.error("Error de geolocalización:", geoError);
          setError("No se pudo obtener tu ubicación. Verifica permisos y prueba buscar por ciudad.");
          setUserLocation(null);
          setLoading(false);
        }
      );
    } else {
      setError("La geolocalización no es soportada por este navegador.");
      setLoading(false);
    }
  }, [searchTerm]);

  const performSearch = useCallback(async (query: string, nearLocation?: GeoCoordinates) => {
    setLoading(true);
    setError(null);

    placeMarkersRef.current.forEach(marker => marker.remove());
    placeMarkersRef.current = [];

    let nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=BO&limit=20&addressdetails=1&extratags=1&dedupe=1`;
    
    let fullQuery = query.trim() || "centro médico"; // Default query if empty
    if (searchCity.trim()) {
        fullQuery += `, ${searchCity.trim()}`;
    }

    nominatimUrl += `&q=${encodeURIComponent(fullQuery)}`;

    if (nearLocation) {
        const R = 0.05; 
        const viewbox = `${nearLocation.lng - R},${nearLocation.lat + R},${nearLocation.lng + R},${nearLocation.lat - R}`;
        nominatimUrl += `&viewbox=${viewbox}&bounded=1`;
    }

    try {
      const response = await fetch(nominatimUrl);
      if (!response.ok) throw new Error(`Error de red: ${response.statusText} (${response.status})`);
      const data: NominatimPlace[] = await response.json();

      if (data && data.length > 0) {
        const newMarkers: LeafletMarker[] = [];
        const uniquePlaces = new Map<string, NominatimPlace>();
        data.forEach(place => { if(!uniquePlaces.has(place.display_name)) uniquePlaces.set(place.display_name, place); });

        uniquePlaces.forEach(place => {
          const lat = parseFloat(place.lat);
          const lon = parseFloat(place.lon);
          if (!isNaN(lat) && !isNaN(lon) && mapRef.current) {
            const marker = L.marker([lat, lon], { icon: medicalIcon })
              .addTo(mapRef.current)
              .bindPopup(`<b>${place.display_name}</b><br><small>${place.address?.road || place.address?.city || 'Detalles no disponibles'}</small>`);
            newMarkers.push(marker);
          }
        });
        placeMarkersRef.current = newMarkers;
        if (newMarkers.length > 0 && mapRef.current) {
             const group = L.featureGroup(newMarkers);
             mapRef.current.fitBounds(group.getBounds().pad(0.2), {maxZoom: nearLocation ? USER_LOCATED_ZOOM : CITY_ZOOM });
        } else if (newMarkers.length === 0) {
             setError("No se encontraron resultados para tu búsqueda en Bolivia.");
        }
      } else {
        setError("No se encontraron resultados para tu búsqueda en Bolivia.");
      }
    } catch (e: any) {
      console.error("Error en la búsqueda con Nominatim:", e);
      setError(`Error al buscar: ${e.message}. Intenta de nuevo.`);
    } finally {
      setLoading(false);
    }
  }, [searchCity]); // Removed userLocation from here, pass it explicitly if needed

  const handleSubmitSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!searchTerm.trim() && !searchCity.trim()) {
        setError("Por favor, ingresa un término de búsqueda o una ciudad.");
        return;
    }
     // If a city is specified, search in that city. If not, and user has been geolocated, search near user.
     // Otherwise (no city, no geolocation), it will search generally in Bolivia based on the query.
    performSearch(searchTerm, !searchCity.trim() && userLocation ? userLocation : undefined);
  };
  
  useEffect(() => {
    if (mapRef.current) {
       handleSubmitSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRef.current]); 

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmitSearch} className="flex flex-col sm:flex-row gap-3 items-stretch p-3 bg-gray-100 rounded-lg">
        <div className="flex-grow min-w-0"> {/* Wrapper for Input to control flex behavior */}
            <Input
            label="Buscar (ej: hospital, clínica)"
            id="search-term"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ej: hospital, farmacia"
            className="w-full" 
            />
        </div>
        <div className="flex-grow min-w-0"> {/* Wrapper for Input */}
            <Input
            label="Ciudad (Bolivia)"
            id="search-city"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Ej: Santa Cruz, Sucre"
            className="w-full"
            />
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2 sm:pt-0 sm:self-end"> {/* Adjusted for button alignment */}
            <Button type="submit" leftIcon={<Search size={18} />} disabled={loading} className="w-full sm:w-auto">
            {loading ? 'Buscando...' : 'Buscar'}
            </Button>
            <Button type="button" variant="ghost" onClick={handleGeolocate} leftIcon={<LocateFixed size={18} />} disabled={loading} title="Buscar cerca de mi ubicación actual" className="w-full sm:w-auto">
            Cerca de Mí
            </Button>
        </div>
      </form>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md flex items-center space-x-2 text-sm">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}
      {loading && !error && <LoadingSpinner text="Procesando..." size="md"/> }

      <div ref={mapContainerRef} className="w-full h-[400px] sm:h-[450px] md:h-[550px] rounded-lg overflow-hidden shadow-md border border-gray-300 z-0">
      </div>
       <style>{`
        .medical-center-div-icon {
          background: transparent !important; 
          border: none !important; 
        }
        .user-location-marker {
          filter: hue-rotate(180deg) brightness(0.9);
        }
      `}</style>
    </div>
  );
};
