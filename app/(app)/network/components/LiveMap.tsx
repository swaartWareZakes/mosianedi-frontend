"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Popup, useMap } from "react-leaflet";
import { Search, Navigation } from "lucide-react";
import L from "leaflet";

// @ts-ignore
import "leaflet/dist/leaflet.css";

// Fix Leaflet Icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- TYPES ---
export type RoadSegment = {
  id: string;
  name: string;
  coordinates: [number, number][]; 
  iri: number;
  width: number;
  surface: "paved" | "gravel";
};

// --- PROVINCE CONFIG ---
// Coordinates to snap to
const PROVINCE_CONFIG: Record<string, { center: [number, number], zoom: number }> = {
    "Gauteng": {
        center: [-26.1076, 28.0567], 
        zoom: 10
    },
    "Free State": {
        center: [-28.4793, 26.1008], // Central Free State (Welkom/Bloem area)
        zoom: 8
    }
};

const DEFAULT_CONFIG = PROVINCE_CONFIG["Gauteng"];

// --- MOCK DATA GENERATOR ---
function generateMockSegments(center: [number, number], count: number): RoadSegment[] {
  return Array.from({ length: count }).map((_, i) => {
    // Spread roads out a bit more for Free State (rural) vs Gauteng (urban)
    const spread = 0.5; 
    const startLat = center[0] + (Math.random() - 0.5) * spread;
    const startLng = center[1] + (Math.random() - 0.5) * spread;
    
    const coords: [number, number][] = [[startLat, startLng]];
    let currLat = startLat;
    let currLng = startLng;
    for(let j=0; j<8; j++) {
        currLat += (Math.random() - 0.5) * 0.05;
        currLng += (Math.random() - 0.5) * 0.05;
        coords.push([currLat, currLng]);
    }

    const iri = 1 + Math.random() * 8; 
    return {
      id: `seg-${i}`,
      name: `Route R${100 + i} - Section ${Math.floor(Math.random() * 5)}`,
      coordinates: coords,
      iri: iri,
      width: Math.random() > 0.7 ? 12 : 8,
      surface: iri > 6 ? "gravel" : "paved"
    };
  });
}

// --- CONTROLLER (The Logic Brain) ---
function MapController({ 
    target, 
    provinceCenter,
    zoom 
}: { 
    target: [number, number] | null, 
    provinceCenter: [number, number],
    zoom: number
}) {
    const map = useMap();

    // 1. Handle Province Switching
    useEffect(() => {
        if (provinceCenter) {
             console.log("Moving Map to:", provinceCenter);
             map.flyTo(provinceCenter, zoom, { duration: 1.5 });
        }
    }, [provinceCenter, zoom, map]);

    // 2. Handle Search/Select Zoom
    useEffect(() => {
        if (target) {
            map.flyTo(target, 13, { duration: 2 });
        }
    }, [target, map]);

    return null;
}

// --- MAIN COMPONENT ---
interface LiveMapProps {
    province?: string; 
    onSegmentSelect: (segment: RoadSegment) => void;
}

export default function LiveMap({ province = "Gauteng", onSegmentSelect }: LiveMapProps) {
  
  // 1. Get Config
  const activeConfig = useMemo(() => {
      const key = Object.keys(PROVINCE_CONFIG).find(k => k.toLowerCase().includes(province.toLowerCase())) || "Gauteng";
      return PROVINCE_CONFIG[key] || DEFAULT_CONFIG;
  }, [province]);

  // 2. Generate Data (Reset when province changes)
  const [segments, setSegments] = useState<RoadSegment[]>([]);
  
  useEffect(() => {
      const newSegments = generateMockSegments(activeConfig.center, 40);
      setSegments(newSegments);
  }, [activeConfig]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [fromAddr, setFromAddr] = useState("");
  const [toAddr, setToAddr] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      setIsSearching(true);
      setTimeout(() => {
          if (segments.length > 0) {
            const randomSeg = segments[Math.floor(Math.random() * segments.length)];
            setActiveId(randomSeg.id);
            onSegmentSelect(randomSeg);
            setMapCenter(randomSeg.coordinates[0]); 
          }
          setIsSearching(false);
      }, 1000);
  };

  return (
    <div className="w-full h-full bg-slate-900 relative z-0 group">
      <MapContainer 
        center={activeConfig.center} 
        zoom={activeConfig.zoom} 
        style={{ height: "100%", width: "100%", background: "#0f172a" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {segments.map((seg) => {
            const color = seg.iri < 3 ? "#10b981" : seg.iri < 6 ? "#f59e0b" : "#ef4444";
            const isActive = activeId === seg.id;

            return (
                <Polyline
                    key={seg.id}
                    positions={seg.coordinates}
                    pathOptions={{ 
                        color: isActive ? "#6366f1" : color,
                        weight: isActive ? 8 : 4,
                        opacity: isActive ? 1 : 0.6 
                    }}
                    eventHandlers={{
                        click: () => {
                            setActiveId(seg.id);
                            onSegmentSelect(seg);
                        }
                    }}
                >
                    <Popup className="custom-popup">
                        <div className="text-slate-900">
                            <strong>{seg.name}</strong><br/>
                            IRI: {seg.iri.toFixed(1)} | {seg.surface}
                        </div>
                    </Popup>
                </Polyline>
            );
        })}
        
        {/* Pass config to controller to handle the move */}
        <MapController 
            target={mapCenter} 
            provinceCenter={activeConfig.center} 
            zoom={activeConfig.zoom}
        />
      </MapContainer>
      
      {/* SEARCH OVERLAY */}
      <div className="absolute top-6 left-6 z-[1000] w-80">
          <form onSubmit={handleSearch} className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl space-y-3">
              <div className="flex items-center gap-2 mb-2">
                  <Navigation className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {province} Route Finder
                  </span>
              </div>
              <div className="space-y-2">
                  <input type="text" placeholder="From (Coords or Address)" value={fromAddr} onChange={(e) => setFromAddr(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                  <input type="text" placeholder="To (Coords or Address)" value={toAddr} onChange={(e) => setToAddr(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <button type="submit" disabled={isSearching} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                  {isSearching ? "Locating..." : <><Search className="w-4 h-4" /> Find Route</>}
              </button>
          </form>
      </div>

      {/* LEGEND */}
      <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur border border-white/10 p-4 rounded-xl z-[1000] text-xs text-white shadow-xl">
        <h4 className="font-bold mb-2 uppercase tracking-wider text-slate-400">Road Condition</h4>
        <div className="space-y-2">
            <div className="flex items-center gap-2"><div className="w-8 h-1 bg-emerald-500 rounded-full"/> Good (0-3)</div>
            <div className="flex items-center gap-2"><div className="w-8 h-1 bg-amber-500 rounded-full"/> Fair (3-6)</div>
            <div className="flex items-center gap-2"><div className="w-8 h-1 bg-rose-500 rounded-full"/> Poor (&gt;6)</div>
        </div>
      </div>
    </div>
  );
}