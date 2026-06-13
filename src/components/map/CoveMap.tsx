"use client";
import { useEffect, useRef, useState } from "react";
import type { User } from "@/lib/types";
import { getInitials, getAvatarColor, cn } from "@/lib/utils";
import ProfileCard from "@/components/profile/ProfileCard";

interface Props {
  users: User[];
  filterFn?: (user: User) => boolean;
}

// ─── Mapbox (tiles only) ─────────────────────────────────────────────────────

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const TOKEN_IS_PLACEHOLDER =
  !MAPBOX_TOKEN ||
  MAPBOX_TOKEN === "your_mapbox_token_here" ||
  MAPBOX_TOKEN.startsWith("your_");

// Zoom and center chosen to show all 30 seed users (SF + Oakland).
const MAP_ZOOM = 11;
const MAP_CENTER: [number, number] = [-122.33, 37.77];

// ─── Mercator SVG projection ─────────────────────────────────────────────────
// Uses the same zoom / center as Mapbox so SVG circles sit in the right area.

const WORLD = 512 * Math.pow(2, MAP_ZOOM); // world size in pixels at this zoom

function mercX(lng: number) {
  return ((lng + 180) / 360) * WORLD;
}
function mercY(lat: number) {
  const s = Math.sin((lat * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * WORLD;
}

// Virtual SVG canvas — large enough to contain all seed users with margin.
const VW = 1200;
const VH = 800;
const CX = mercX(MAP_CENTER[0]);
const CY = mercY(MAP_CENTER[1]);

function toSVG(lng: number, lat: number) {
  return {
    x: +(mercX(lng) - CX + VW / 2).toFixed(1),
    y: +(mercY(lat) - CY + VH / 2).toFixed(1),
  };
}

// ─── Avatar colour helpers ───────────────────────────────────────────────────

const AVATAR_HEX: Record<string, string> = {
  "bg-[#E8734A]": "#E8734A",
  "bg-[#7B9E87]": "#7B9E87",
  "bg-[#9B8EC4]": "#9B8EC4",
  "bg-[#6BAED6]": "#6BAED6",
  "bg-[#F4A574]": "#F4A574",
  "bg-[#A8D5BA]": "#A8D5BA",
  "bg-[#D4A5A5]": "#D4A5A5",
  "bg-[#B5C4D1]": "#B5C4D1",
};
function hex(name: string) {
  return AVATAR_HEX[getAvatarColor(name)] ?? "#E8734A";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CoveMap({ users, filterFn }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mapboxReady, setMapboxReady] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const visibleUsers = filterFn ? users.filter(filterFn) : users;

  // Load Mapbox tiles in the background — tiles only, no marker API.
  useEffect(() => {
    if (TOKEN_IS_PLACEHOLDER) return;
    let alive = true;

    (async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (!alive || !mapContainer.current) return;

        (mapboxgl as unknown as { accessToken: string }).accessToken = MAPBOX_TOKEN;

        const map = new (mapboxgl as unknown as { Map: new (o: unknown) => unknown }).Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: MAP_CENTER,
          zoom: MAP_ZOOM,
          attributionControl: false,
        });

        mapRef.current = map;

        (map as { on: (e: string, cb: () => void) => void }).on("load", () => {
          if (!alive) return;
          clearTimeout(timeoutRef.current!);
          setMapboxReady(true);
        });

        (map as { on: (e: string, cb: (e?: unknown) => void) => void }).on("error", () => {
          clearTimeout(timeoutRef.current!);
        });

        timeoutRef.current = setTimeout(() => {
          if (alive) console.warn("[Cove] Mapbox timed out");
        }, 8000);
      } catch {
        // stay on fallback background
      }
    })();

    return () => {
      alive = false;
      clearTimeout(timeoutRef.current!);
      if (mapRef.current) (mapRef.current as { remove: () => void }).remove();
    };
  }, []);

  return (
    <div className="relative w-full h-full">

      {/* ── Layer 1: background ─────────────────────────────────────────── */}
      {/* Fallback illustration shown until Mapbox tiles are ready */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-500",
        mapboxReady ? "opacity-0 pointer-events-none" : "opacity-100",
      )}>
        <MapBackground />
      </div>

      {/* Mapbox tile canvas */}
      {!TOKEN_IS_PLACEHOLDER && (
        <div className={cn(
          "absolute inset-0 transition-opacity duration-500",
          mapboxReady ? "opacity-100" : "opacity-0 pointer-events-none",
        )}>
          <div ref={mapContainer} className="w-full h-full" />
        </div>
      )}

      {/* ── Layer 2: SVG markers — always mounted, zero state dependencies ── */}
      {/*
        Mercator-projected SVG pinned over the entire map area.
        preserveAspectRatio="xMidYMid slice" fills the container and keeps
        the geographic centre aligned with the Mapbox centre.
        pointerEvents on the <svg> is none so pan/zoom still reach Mapbox;
        each <g> re-enables it so clicks register on the circles.
      */}
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 10,
          overflow: "visible",
        }}
      >
        {visibleUsers.map((user) => {
          const { x, y } = toSVG(user.coordinates.lng, user.coordinates.lat);
          const fill = hex(user.name);
          const selected = selectedUser?.id === user.id;

          return (
            <g
              key={user.id}
              transform={`translate(${x},${y})`}
              onClick={() => setSelectedUser((p) => (p?.id === user.id ? null : user))}
              style={{ cursor: "pointer", pointerEvents: "auto" }}
            >
              {/* subtle drop shadow */}
              <circle r={21} fill="rgba(0,0,0,0.12)" transform="translate(1,2)" />

              {/* avatar circle */}
              <circle
                r={20}
                fill={fill}
                stroke={selected ? "#E8734A" : "white"}
                strokeWidth={selected ? 3 : 2.5}
              />

              {/* selection ring */}
              {selected && (
                <circle r={26} fill="none" stroke="rgba(232,115,74,0.4)" strokeWidth={4} />
              )}

              {/* initials */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize={12}
                fontWeight="700"
                fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {getInitials(user.name)}
              </text>

              {/* "Open to Meet" green dot */}
              {user.availability === "Open to Meet" && (
                <circle r={5} cx={14} cy={14} fill="#7B9E87" stroke="white" strokeWidth={2} />
              )}
            </g>
          );
        })}
      </svg>

      {/* ── Layer 3: profile card popup ─────────────────────────────────── */}
      {selectedUser && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <ProfileCard user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
      )}
    </div>
  );
}

// ─── Fallback background (no user circles — SVG layer handles those) ──────────

function MapBackground() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#E8F4F8] via-[#EEF2E6] to-[#F5EDDF]">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="cove-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4A7C6F" strokeWidth="0.4" opacity="0.15" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cove-grid)" />
        <line x1="0" y1="35%" x2="100%" y2="33%" stroke="#B8C8B0" strokeWidth="2" opacity="0.5" />
        <line x1="0" y1="55%" x2="100%" y2="57%" stroke="#B8C8B0" strokeWidth="1.5" opacity="0.4" />
        <line x1="20%" y1="0" x2="22%" y2="100%" stroke="#B8C8B0" strokeWidth="2" opacity="0.5" />
        <line x1="45%" y1="0" x2="43%" y2="100%" stroke="#B8C8B0" strokeWidth="1.5" opacity="0.4" />
        <line x1="70%" y1="0" x2="72%" y2="100%" stroke="#B8C8B0" strokeWidth="2" opacity="0.5" />
      </svg>

      {[
        { label: "Mission", x: "20%", y: "65%" },
        { label: "SoMa", x: "45%", y: "44%" },
        { label: "Hayes Valley", x: "33%", y: "39%" },
        { label: "Marina", x: "15%", y: "17%" },
        { label: "Temescal", x: "72%", y: "19%" },
        { label: "Fruitvale", x: "80%", y: "62%" },
        { label: "Lake Merritt", x: "67%", y: "37%" },
      ].map(({ label, x, y }) => (
        <span
          key={label}
          className="absolute text-[9px] font-bold text-[#5A7A70] uppercase tracking-widest pointer-events-none select-none opacity-50"
          style={{ left: x, top: y, transform: "translate(-50%,-50%)" }}
        >
          {label}
        </span>
      ))}

      <div className="absolute bottom-4 left-4 bg-white/85 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-[#737373] shadow-sm border border-white/60 flex items-center gap-1.5">
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7B9E87", display: "inline-block" }} />
        Open to Meet
      </div>
    </div>
  );
}
