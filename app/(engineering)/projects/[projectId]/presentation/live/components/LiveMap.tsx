"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- PROVINCE CONFIG ---
const PROVINCES = {
    "Gauteng": { center: [-26.1076, 28.0567] as [number, number], zoom: 10 },
    "Free State": { center: [-28.4793, 26.1008] as [number, number], zoom: 8 },
    "Western Cape": { center: [-33.55, 19.50] as [number, number], zoom: 8 },
    "KwaZulu-Natal": { center: [-29.0, 30.5] as [number, number], zoom: 8 },
    "Eastern Cape": { center: [-32.0, 26.5] as [number, number], zoom: 8 },
    "Limpopo": { center: [-24.0, 29.5] as [number, number], zoom: 8 },
    "Mpumalanga": { center: [-25.5, 30.0] as [number, number], zoom: 8 },
    "North West": { center: [-26.0, 26.0] as [number, number], zoom: 8 },
    "Northern Cape": { center: [-29.5, 21.0] as [number, number], zoom: 7 },
    "Default": { center: [-29.0, 26.0] as [number, number], zoom: 6 } 
};

function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 3.5, easeLinearity: 0.1 }); // Slower, cinematic fly
    }, [center, zoom, map]);
    return null;
}

const getConditionColor = (iri: number) => {
  if (iri < 3.5) return "#10b981"; // Emerald
  if (iri < 6.5) return "#f59e0b"; // Amber
  return "#f43f5e"; // Rose (Red)
};

export default function LiveMap({ activeLayer, segments, province = "Gauteng" }: any) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const config = useMemo(() => {
      const key = Object.keys(PROVINCES).find(k => province.includes(k)) || "Default";
      return PROVINCES[key as keyof typeof PROVINCES];
  }, [province]);

  // Mock data generator if no real segments
  const displaySegments = useMemo(() => {
      if (segments && segments.length > 0) return segments;
      
      return Array.from({ length: 80 }).map((_, i) => {
          const spread = config.zoom < 8 ? 2.0 : 0.6;
          const lat = config.center[0] + (Math.random() - 0.5) * spread;
          const lng = config.center[1] + (Math.random() - 0.5) * spread;
          
          // Random walk for line shape
          const p1: [number, number] = [lat, lng];
          const p2: [number, number] = [lat + (Math.random() - 0.5)*0.1, lng + (Math.random() - 0.5)*0.1];

          return {
              id: i,
              positions: [p1, p2],
              iri: 1 + Math.random() * 9, // Random IRI 1-10
              name: `Route R${100 + i}`
          };
      });
  }, [segments, config]);

  if (!mounted) return <div className="w-full h-full bg-slate-950" />;

  return (
    <MapContainer 
      center={config.center} 
      zoom={config.zoom} 
      style={{ height: "100%", width: "100%", background: "transparent" }} 
      zoomControl={false}
      scrollWheelZoom={false}
      dragging={false} // Disable dragging for presentation mode
      doubleClickZoom={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        opacity={0.6} // Dim the map so overlays pop
      />
      
      <MapController center={config.center} zoom={config.zoom} />

      {displaySegments.map((line: any) => {
        const color = activeLayer === 'condition' ? getConditionColor(line.iri) : '#3b82f6';
        const isBad = line.iri > 6;
        
        return (
            <Polyline
            key={line.id}
            positions={line.positions}
            pathOptions={{
                color: color,
                weight: activeLayer === 'condition' && isBad ? 3 : 1.5,
                opacity: activeLayer === 'condition' ? (isBad ? 0.9 : 0.3) : 0.4,
            }}
            />
        )
      })}
    </MapContainer>
  );
}