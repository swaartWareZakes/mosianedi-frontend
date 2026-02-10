"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet"; // Corrected import

// @ts-ignore
import "leaflet/dist/leaflet.css";

// --- PROVINCE CONFIG ---
const PROVINCE_CONFIG: Record<string, { center: [number, number], zoom: number }> = {
    "Gauteng": { center: [-26.1076, 28.0567], zoom: 10 },
    "Free State": { center: [-28.4793, 26.1008], zoom: 8 },
    "Western Cape": { center: [-33.2278, 21.8569], zoom: 8 },
    "KwaZulu-Natal": { center: [-29.0, 30.0], zoom: 8 },
    "Eastern Cape": { center: [-32.2968, 26.4194], zoom: 8 },
    "Limpopo": { center: [-23.4013, 29.4179], zoom: 8 },
    "Mpumalanga": { center: [-25.5656, 30.5279], zoom: 8 },
    "North West": { center: [-26.6639, 25.2838], zoom: 8 },
    "Northern Cape": { center: [-29.0467, 21.8569], zoom: 7 },
};

const DEFAULT_CONFIG = PROVINCE_CONFIG["Gauteng"];

// --- CONTROLLER ---
function MapController({ provinceCenter, zoom }: { provinceCenter: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        if (provinceCenter) {
             map.flyTo(provinceCenter, zoom, { duration: 2.0 });
        }
    }, [provinceCenter, zoom, map]);
    return null;
}

interface LiveMapProps {
    province?: string; 
    onSegmentSelect?: (segment: any) => void; // Optional to prevent type errors
    theme?: "light" | "dark";
}

export default function LiveMap({ province = "Gauteng", theme = "dark" }: LiveMapProps) {
  
  const activeConfig = useMemo(() => {
      const key = Object.keys(PROVINCE_CONFIG).find(k => k.toLowerCase().includes(province.toLowerCase()));
      return PROVINCE_CONFIG[key || "Gauteng"] || DEFAULT_CONFIG;
  }, [province]);

  // Use the theme to determine the tile layer
  const tileUrl = theme === "light" 
    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="w-full h-full relative z-0 group">
      <MapContainer 
        center={activeConfig.center} 
        zoom={activeConfig.zoom} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer attribution='&copy; OpenStreetMap' url={tileUrl} />
        <MapController provinceCenter={activeConfig.center} zoom={activeConfig.zoom} />
      </MapContainer>
      
      <div className="absolute top-6 left-6 z-[1000] bg-black/60 backdrop-blur px-4 py-2 rounded-lg border border-white/10 text-white">
          <div className="text-[10px] uppercase font-bold text-slate-400">Viewing Region</div>
          <div className="text-sm font-bold">{province}</div>
      </div>
    </div>
  );
}