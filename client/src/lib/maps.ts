import { useEffect, useState } from 'react';

// Google Maps API Key will be fetched from environment variables
const MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Load Google Maps API dynamically
export function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.gomaps.pro/maps/api/js?key=AlzaSyRzFT5SgIpSvFRm7GgjhCXPeJFgSoiQ1NTGomaps&libraries=geometry,places&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (error) => reject(new Error(`Failed to load Google Maps: ${error}`));
    document.head.appendChild(script);
  });
}

// Hook to initialize Google Maps
export function useGoogleMaps(elementId: string, options: google.maps.MapOptions = {}) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initMap() {
      try {
        setLoading(true);
        await loadGoogleMapsScript();
        
        const element = document.getElementById(elementId);
        if (!element) {
          throw new Error(`Element with ID "${elementId}" not found`);
        }

        const defaultOptions: google.maps.MapOptions = {
          center: { lat: 12.9716, lng: 77.5946 }, // Bangalore by default
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          ...options
        };

        const newMap = new google.maps.Map(element, defaultOptions);
        setMap(newMap);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    }

    initMap();
    
    return () => {
      // Cleanup if needed
    };
  }, [elementId, options]);

  return { map, loading, error };
}

// Calculate distance between two points
export function calculateDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error('Google Maps API not loaded'));
      return;
    }

    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [new google.maps.LatLng(origin.lat, origin.lng)],
        destinations: [new google.maps.LatLng(destination.lat, destination.lng)],
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK' && response) {
          const distance = response.rows[0].elements[0].distance.value; // in meters
          resolve(distance / 1000); // Convert to kilometers
        } else {
          reject(new Error(`Distance calculation failed: ${status}`));
        }
      }
    );
  });
}

// Create a marker on the map
export function createMarker(
  map: google.maps.Map,
  position: { lat: number; lng: number },
  options: google.maps.MarkerOptions = {}
): google.maps.Marker {
  return new google.maps.Marker({
    position,
    map,
    ...options
  });
}

// Create a route between two points
export function createRoute(
  map: google.maps.Map,
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<google.maps.DirectionsResult> {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error('Google Maps API not loaded'));
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
    });

    directionsService.route(
      {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
          resolve(result);
        } else {
          reject(new Error(`Route calculation failed: ${status}`));
        }
      }
    );
  });
}

// Get address from coordinates (reverse geocoding)
export function getAddressFromCoordinates(
  lat: number,
  lng: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error('Google Maps API not loaded'));
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      }
    );
  });
}
