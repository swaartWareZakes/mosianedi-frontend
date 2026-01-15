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

// --- PROVINCE CONFIG (ALL 9 PROVINCES) ---
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
    "Default": { center: [-29.0, 26.0] as [number, number], zoom: 6 } // SA Center
};

function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 2.5, easeLinearity: 0.5 });
    }, [center, zoom, map]);
    return null;
}

const getConditionColor = (iri: number) => {
  if (iri < 3) return "#10b981"; // Good (Emerald)
  if (iri < 6) return "#f59e0b"; // Fair (Amber)
  return "#ef4444"; // Poor (Red)
};

export default function LiveMap({ activeLayer, segments, province = "Gauteng" }: any) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const config = useMemo(() => {
      // Find matching key, or default
      const key = Object.keys(PROVINCES).find(k => province.includes(k)) || "Default";
      return PROVINCES[key as keyof typeof PROVINCES];
  }, [province]);

  const displaySegments = useMemo(() => {
      if (segments && segments.length > 0) return segments;
      
      // GENERATE MOCK DATA AROUND THE CHOSEN PROVINCE
      return Array.from({ length: 50 }).map((_, i) => {
          // Spread logic varies by zoom level slightly
          const spread = config.zoom < 8 ? 1.5 : 0.5;
          
          const lat = config.center[0] + (Math.random() - 0.5) * spread;
          const lng = config.center[1] + (Math.random() - 0.5) * spread;
          
          return {
              id: i,
              positions: [[lat, lng], [lat + (Math.random() - 0.02), lng + (Math.random() - 0.02)]],
              iri: 1 + Math.random() * 8, // Random IRI 1-9
              name: `Route R${100 + i}`
          };
      });
  }, [segments, config]);

  if (!mounted) return <div className="w-full h-full bg-slate-950" />;

  return (
    <MapContainer 
      center={config.center} 
      zoom={config.zoom} 
      style={{ height: "100%", width: "100%", background: "#020617" }} 
      zoomControl={false}
      scrollWheelZoom={false}
      dragging={true}
    >
      {/* Dark Matter - No Labels for cleaner look */}
      <TileLayer
        attribution='&copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      />
      {/* Labels on top */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
      />
      
      <MapController center={config.center} zoom={config.zoom} />

      {displaySegments.map((line: any) => (
        <Polyline
          key={line.id}
          positions={line.positions}
          pathOptions={{
            color: activeLayer === 'condition' ? getConditionColor(line.iri) : '#3b82f6', // Blue default
            weight: activeLayer === 'condition' ? 3 : 1.5,
            opacity: activeLayer === 'condition' ? 0.8 : 0.3,
          }}
        >
          <Tooltip sticky className="custom-leaflet-tooltip">
            <div className="font-bold text-xs">{line.name}</div>
            <div className="text-xs">IRI: {line.iri?.toFixed(1)}</div>
          </Tooltip>
        </Polyline>
      ))}
    </MapContainer>
  );
}