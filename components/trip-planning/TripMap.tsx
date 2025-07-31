'use client';

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Suggestion } from '@prisma/client';
import { useEffect, useState } from 'react';

interface TripMapProps {
  suggestions: Suggestion[];
}

interface Location {
  key: string;
  lat: number;
  lng: number;
  name: string;
}

export default function TripMap({ suggestions }: TripMapProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [center, setCenter] = useState({ lat: 31.6295, lng: -7.9811 }); // Default to Marrakech

  useEffect(() => {
    const allLocations: Location[] = [];
    if (suggestions && suggestions.length > 0) {
      suggestions.forEach(suggestion => {
        const itinerary = suggestion.itinerary as any[]; // Cast to handle the JSON structure
        itinerary.forEach(day => {
          if (day.morning?.coords) allLocations.push({ key: `${suggestion.id}-m`, ...day.morning.coords, name: day.morning.locationName });
          if (day.afternoon?.coords) allLocations.push({ key: `${suggestion.id}-a`, ...day.afternoon.coords, name: day.afternoon.locationName });
          if (day.evening?.coords) allLocations.push({ key: `${suggestion.id}-e`, ...day.evening.coords, name: day.evening.locationName });
        });
      });

      // Set the map center to the first valid location
      if (allLocations.length > 0) {
        const firstValidLocation = allLocations.find(loc => loc.lat && loc.lng);
        if (firstValidLocation) {
          setCenter({ lat: firstValidLocation.lat, lng: firstValidLocation.lng });
        }
      }
    }
    setLocations(allLocations);
  }, [suggestions]);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_Maps_API_KEY!}>
      <div style={{ height: '400px', width: '100%' }}>
        <Map
          defaultCenter={center}
          defaultZoom={12}
          mapId="MEX_TRIP_MAP" // A unique ID for styling
        >
          {locations.map(loc => (
            loc.lat && loc.lng && (
              <AdvancedMarker key={loc.key} position={{ lat: loc.lat, lng: loc.lng }} title={loc.name} />
            )
          ))}
        </Map>
      </div>
    </APIProvider>
  );
}