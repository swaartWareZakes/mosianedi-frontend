"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

// --- 1. Fix Leaflet Icons in Next.js ---
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- 2. Mock Coordinates (Gauteng Demo) ---
// In the future, these will come from your uploaded GIS/KML files.
const MOCK_NODES: Record<string, [number, number]> = {
  "N1": [-25.7479, 28.2293], // Pretoria Central
  "N2": [-25.8640, 28.1887], // Centurion
  "N3": [-26.0123, 28.1293], // Midrand
  "P1": [-25.7689, 28.3293], // Pretoria East
  "P2": [-25.8989, 28.2993], // Rietvlei
  "P3": [-25.9989, 28.2593], // Clayville
  "L1": [-25.7313, 28.1698], // Pretoria West
  "L2": [-25.7113, 28.1498], 
};

// --- 3. Helper for Colors ---
const getConditionColor = (iri: number) => {
  if (iri < 2.5) return "#10b981"; // Emerald (Good)
  if (iri < 5.0) return "#f59e0b"; // Amber (Fair)
  return "#ef4444"; // Red (Poor)
};

// --- 4. Component ---
export default function LiveMap({ activeLayer, segments }: { activeLayer: string, segments: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full bg-slate-950 animate-pulse" />;

  // Transform segments into map lines
  const mapLines = segments.map((seg, i) => {
    // If node ID exists in mock, use it. Otherwise, offset slightly so they show up on map.
    const start = MOCK_NODES[seg.from_node] || [-25.7 + (i * 0.02), 28.2 + (i * 0.02)];
    const end = MOCK_NODES[seg.to_node] || [-25.75 + (i * 0.03), 28.25 + (i * 0.03)];
    
    return {
      id: seg.segment_id || `seg-${i}`,
      positions: [start, end] as [number, number][],
      iri: seg.iri || 3.0,
      name: `${seg.road_id || 'Road'}: ${seg.from_node} to ${seg.to_node}`,
      surface: seg.surface_type || 'Unknown'
    };
  });

  return (
    <MapContainer 
      center={[-25.8640, 28.1887]} 
      zoom={10} 
      style={{ height: "100%", width: "100%", background: "#020617" }} // Slate-950
      zoomControl={false}
      scrollWheelZoom={false} // Prevent accidental zooming during presentation
    >
      {/* Dark Matter Tiles for "Command Center" look */}
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {mapLines.map((line) => (
        <Polyline
          key={line.id}
          positions={line.positions}
          pathOptions={{
            // Logic: Blue for intro/default, Colored for Condition view
            color: activeLayer === 'condition' ? getConditionColor(line.iri) : '#6366f1', 
            weight: activeLayer === 'condition' ? 6 : 3,
            opacity: activeLayer === 'condition' ? 0.9 : 0.5,
          }}
        >
          <Tooltip sticky className="custom-leaflet-tooltip">
            <div className="font-bold text-xs">{line.name}</div>
            <div className="text-xs">IRI: {line.iri.toFixed(1)}</div>
            <div className="text-xs opacity-70">{line.surface}</div>
          </Tooltip>
        </Polyline>
      ))}
    </MapContainer>
  );
}