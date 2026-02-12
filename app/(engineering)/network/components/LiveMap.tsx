"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
import L from "leaflet";

export type LiveMapTheme = "light" | "dark" | "system";
export type LiveMapLayer = "default" | "condition";

export type LiveMapSegment = {
  id: string | number;
  positions: [number, number][]; // polyline points
  iri?: number; // 1..10 typical
  name?: string;
  [k: string]: any;
};

export interface LiveMapProps {
  province?: string;
  theme?: LiveMapTheme;

  // Presentation mode / styling
  activeLayer?: LiveMapLayer;
  segments?: LiveMapSegment[];

  // Interaction (inventory / later inspector)
  onSegmentSelect?: (segment: LiveMapSegment) => void;

  // Presentation cinematic lock
  locked?: boolean; // true => no dragging/zoom/scroll (presentations)
  tileOpacity?: number; // presentation wants dim tiles
}

const PROVINCES: Record<string, { center: [number, number]; zoom: number }> = {
  Gauteng: { center: [-26.1076, 28.0567], zoom: 10 },
  "Free State": { center: [-28.4793, 26.1008], zoom: 8 },
  "Western Cape": { center: [-33.55, 19.5], zoom: 8 },
  "KwaZulu-Natal": { center: [-29.0, 30.5], zoom: 8 },
  "Eastern Cape": { center: [-32.0, 26.5], zoom: 8 },
  Limpopo: { center: [-24.0, 29.5], zoom: 8 },
  Mpumalanga: { center: [-25.5, 30.0], zoom: 8 },
  "North West": { center: [-26.0, 26.0], zoom: 8 },
  "Northern Cape": { center: [-29.5, 21.0], zoom: 7 },
  Default: { center: [-29.0, 26.0], zoom: 6 },
};

// --- Fix default leaflet marker assets (only if you ever use markers) ---
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
/* eslint-enable @typescript-eslint/ban-ts-comment */

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 2.0 });
  }, [center, zoom, map]);
  return null;
}

function resolveTheme(theme: LiveMapTheme): "light" | "dark" {
  if (theme === "light" || theme === "dark") return theme;
  // system: infer from html.dark
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getConditionColor(iri: number) {
  if (iri < 3.5) return "#10b981"; // good
  if (iri < 6.5) return "#f59e0b"; // fair
  return "#f43f5e"; // poor
}

function normalizeProvinceKey(province: string) {
  const p = (province || "").toLowerCase();
  const match = Object.keys(PROVINCES).find((k) => p.includes(k.toLowerCase()));
  return match ?? "Default";
}

export default function LiveMap({
  province = "Gauteng",
  theme = "system",
  activeLayer = "default",
  segments,
  onSegmentSelect,
  locked = false,
  tileOpacity,
}: LiveMapProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"light" | "dark">("dark");

  useEffect(() => setMounted(true), []);

  // keep mode synced when theme=system and user toggles html.dark
  useEffect(() => {
    if (!mounted) return;

    const compute = () => setMode(resolveTheme(theme));
    compute();

    if (theme !== "system") return;

    const el = document.documentElement;
    const obs = new MutationObserver(compute);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, [theme, mounted]);

  const config = useMemo(() => {
    const key = normalizeProvinceKey(province);
    return PROVINCES[key] ?? PROVINCES.Default;
  }, [province]);

  const tiles =
    mode === "light"
      ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  // If no segments provided, generate mock polylines (useful for demo/presentation)
  const displaySegments: LiveMapSegment[] = useMemo(() => {
    if (segments && segments.length > 0) return segments;

    const spread = config.zoom < 8 ? 2.0 : 0.6;

    return Array.from({ length: 80 }).map((_, i) => {
      const lat = config.center[0] + (Math.random() - 0.5) * spread;
      const lng = config.center[1] + (Math.random() - 0.5) * spread;

      const p1: [number, number] = [lat, lng];
      const p2: [number, number] = [
        lat + (Math.random() - 0.5) * 0.1,
        lng + (Math.random() - 0.5) * 0.1,
      ];

      return {
        id: i,
        positions: [p1, p2],
        iri: 1 + Math.random() * 9,
        name: `Route R${100 + i}`,
      };
    });
  }, [segments, config]);

  if (!mounted) {
    // neutral (uses CSS vars) — no slate/dark confusion
    return <div className="w-full h-full bg-[var(--background)]" />;
  }

  const effectiveTileOpacity =
    typeof tileOpacity === "number"
      ? tileOpacity
      : locked
      ? 0.6 // presentation: dim
      : 1.0; // normal

  return (
    <MapContainer
      center={config.center}
      zoom={config.zoom}
      style={{ height: "100%", width: "100%", background: "transparent" }}
      zoomControl={false}
      scrollWheelZoom={!locked}
      dragging={!locked}
      doubleClickZoom={!locked}
      attributionControl={false}
    >
      <TileLayer url={tiles} opacity={effectiveTileOpacity} />

      <MapController center={config.center} zoom={config.zoom} />

      {displaySegments.map((line) => {
        const iri = Number(line.iri ?? 0);
        const isBad = iri > 6;

        const color =
          activeLayer === "condition" ? getConditionColor(iri) : "#3b82f6";

        return (
          <Polyline
            key={String(line.id)}
            positions={line.positions}
            pathOptions={{
              color,
              weight: activeLayer === "condition" && isBad ? 3 : 1.5,
              opacity:
                activeLayer === "condition"
                  ? isBad
                    ? 0.9
                    : 0.3
                  : 0.4,
            }}
            eventHandlers={
              onSegmentSelect
                ? {
                    click: () => onSegmentSelect(line),
                  }
                : undefined
            }
          />
        );
      })}
    </MapContainer>
  );
}