"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Popup, useMap, Marker } from "react-leaflet";
import { Search, Navigation, Loader2, MapPin } from "lucide-react";
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
  distance: number; // km
};

// --- PROVINCE CONFIG (ALL 9) ---
const PROVINCE_CONFIG: Record<string, { center: [number, number], zoom: number }> = {
    "Gauteng": { center: [-26.1076, 28.0567], zoom: 10 },
    "Free State": { center: [-28.4793, 26.1008], zoom: 8 },
    "Western Cape": { center: [-33.2278, 21.8569], zoom: 8 },
    "KwaZulu-Natal": { center: [-29.0, 30.0], zoom: 8 }, // Adjusted KZN center
    "Eastern Cape": { center: [-32.2968, 26.4194], zoom: 8 },
    "Limpopo": { center: [-23.4013, 29.4179], zoom: 8 },
    "Mpumalanga": { center: [-25.5656, 30.5279], zoom: 8 },
    "North West": { center: [-26.6639, 25.2838], zoom: 8 },
    "Northern Cape": { center: [-29.0467, 21.8569], zoom: 7 },
};

const DEFAULT_CONFIG = PROVINCE_CONFIG["Gauteng"];

// --- API HELPERS ---
async function geocode(query: string): Promise<[number, number] | null> {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data && data[0]) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
    } catch (e) {
        console.error("Geocoding failed", e);
    }
    return null;
}

async function fetchRoute(start: [number, number], end: [number, number]): Promise<[number, number][]> {
    try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`);
        const data = await res.json();
        if (data.routes && data.routes[0]) {
            return data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
        }
    } catch (e) {
        console.error("Routing failed", e);
    }
    return [];
}

// --- CONTROLLER (HANDLES MAP MOVEMENT) ---
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
             console.log("Flying to province:", provinceCenter);
             map.flyTo(provinceCenter, zoom, { duration: 2.5, easeLinearity: 0.25 });
        }
    }, [provinceCenter, zoom, map]);

    // 2. Handle Search Target
    useEffect(() => {
        if (target) {
            map.flyTo(target, 12, { duration: 1.5 });
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
  
  // 1. IMPROVED CONFIG MATCHING
  // This logic strips spaces, hyphens and casing to ensure "KwaZulu Natal" matches "KwaZulu-Natal"
  const activeConfig = useMemo(() => {
      if (!province) return DEFAULT_CONFIG;

      // Normalize helper: "Eastern Cape" -> "easterncape"
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
      
      const input = normalize(province);

      // Handle common aliases manually
      if (input.includes("kzn") || input.includes("natal")) return PROVINCE_CONFIG["KwaZulu-Natal"];
      if (input.includes("gauteng") || input.includes("gp")) return PROVINCE_CONFIG["Gauteng"];
      if (input.includes("freestate") || input.includes("fs")) return PROVINCE_CONFIG["Free State"];
      if (input.includes("eastern") || input.includes("ec")) return PROVINCE_CONFIG["Eastern Cape"];
      if (input.includes("western") || input.includes("wc")) return PROVINCE_CONFIG["Western Cape"];
      if (input.includes("northern") || input.includes("nc")) return PROVINCE_CONFIG["Northern Cape"];
      if (input.includes("limpopo")) return PROVINCE_CONFIG["Limpopo"];
      if (input.includes("mpumalanga")) return PROVINCE_CONFIG["Mpumalanga"];
      if (input.includes("northwest") || input.includes("nw")) return PROVINCE_CONFIG["North West"];

      // Fallback: Check if any config key contains the input
      const key = Object.keys(PROVINCE_CONFIG).find(k => normalize(k).includes(input));
      return PROVINCE_CONFIG[key || "Gauteng"] || DEFAULT_CONFIG;

  }, [province]);

  const [segments, setSegments] = useState<RoadSegment[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [fromAddr, setFromAddr] = useState("");
  const [toAddr, setToAddr] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  // 2. Clear map when province changes
  useEffect(() => {
      setSegments([]); 
      setFromAddr("");
      setToAddr("");
  }, [activeConfig]);

  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!fromAddr || !toAddr) return;

      setIsSearching(true);
      
      // A. Geocode
      // Append province to query to ensure results are local
      const regionContext = province !== "Gauteng" ? province : "South Africa";
      
      const startCoords = await geocode(`${fromAddr}, ${regionContext}`);
      const endCoords = await geocode(`${toAddr}, ${regionContext}`);

      if (startCoords && endCoords) {
          // B. Route
          const routeCoords = await fetchRoute(startCoords, endCoords);
          
          if (routeCoords.length > 0) {
              const newSegment: RoadSegment = {
                  id: `route-${Date.now()}`,
                  name: `${fromAddr} to ${toAddr}`,
                  coordinates: routeCoords,
                  iri: 2 + Math.random() * 6, 
                  width: 10,
                  surface: "paved",
                  distance: routeCoords.length * 0.1 
              };

              setSegments([newSegment]); 
              setActiveId(newSegment.id);
              onSegmentSelect(newSegment);
              
              const midIndex = Math.floor(routeCoords.length / 2);
              setMapCenter(routeCoords[midIndex]);
          } else {
              alert("Could not calculate route. Try closer locations.");
          }
      } else {
          alert("Could not locate one of those places. Check spelling.");
      }
      
      setIsSearching(false);
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
                <React.Fragment key={seg.id}>
                    <Marker position={seg.coordinates[0]} />
                    <Polyline
                        positions={seg.coordinates}
                        pathOptions={{ 
                            color: isActive ? "#3b82f6" : color,
                            weight: isActive ? 6 : 4,
                            opacity: 0.8
                        }}
                        eventHandlers={{
                            click: () => {
                                setActiveId(seg.id);
                                onSegmentSelect(seg);
                            }
                        }}
                    >
                        <Popup className="custom-popup">
                            <div className="text-slate-900 p-1">
                                <strong className="text-sm">{seg.name}</strong>
                                <div className="text-xs mt-1 text-slate-600">
                                    Condition: <strong>{seg.iri.toFixed(1)} IRI</strong><br/>
                                    Surface: {seg.surface}
                                </div>
                            </div>
                        </Popup>
                    </Polyline>
                    <Marker position={seg.coordinates[seg.coordinates.length - 1]} />
                </React.Fragment>
            );
        })}
        
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
                      {province} Planner
                  </span>
              </div>
              <div className="space-y-2">
                  <div className="relative">
                      <MapPin className="w-3 h-3 text-slate-400 absolute left-3 top-3" />
                      <input 
                        type="text" 
                        placeholder="Start (e.g. Town Hall)" 
                        value={fromAddr} 
                        onChange={(e) => setFromAddr(e.target.value)} 
                        className="w-full bg-slate-800/50 border border-white/10 rounded-lg py-2 pl-8 pr-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-500" 
                      />
                  </div>
                  <div className="relative">
                      <MapPin className="w-3 h-3 text-slate-400 absolute left-3 top-3" />
                      <input 
                        type="text" 
                        placeholder="End (e.g. Main Road)" 
                        value={toAddr} 
                        onChange={(e) => setToAddr(e.target.value)} 
                        className="w-full bg-slate-800/50 border border-white/10 rounded-lg py-2 pl-8 pr-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-500" 
                      />
                  </div>
              </div>
              <button type="submit" disabled={isSearching} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Find & Mark Road</>}
              </button>
          </form>
          
          {segments.length > 0 && (
              <div className="mt-2 bg-emerald-900/50 border border-emerald-500/30 p-2 rounded-lg text-xs text-emerald-200 text-center animate-in fade-in">
                  Route found and marked.
              </div>
          )}
      </div>

      {/* LEGEND */}
      <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur border border-white/10 p-4 rounded-xl z-[1000] text-xs text-white shadow-xl">
        <h4 className="font-bold mb-2 uppercase tracking-wider text-slate-400">Layer Info</h4>
        <div className="space-y-2">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"/> Good</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"/> Warning</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"/> Critical</div>
        </div>
      </div>
    </div>
  );
}