"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Plus, Minus, Locate } from "lucide-react";
import type { User } from "@/lib/types";
import ProfileCard from "@/components/profile/ProfileCard";

interface Props {
  users: User[];
  filterFn?: (user: User) => boolean;
}

// ─── Mercator projection helpers ─────────────────────────────────────────────

const DEG = Math.PI / 180;
const TILE = 512;

function wx(lng: number, z: number) {
  return ((lng + 180) / 360) * TILE * 2 ** z;
}
function wy(lat: number, z: number) {
  const s = Math.sin(lat * DEG);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TILE * 2 ** z;
}
function toLng(x: number, z: number) {
  return (x / (TILE * 2 ** z)) * 360 - 180;
}
function toLat(y: number, z: number) {
  return (Math.atan(Math.sinh(Math.PI - (2 * Math.PI * y) / (TILE * 2 ** z))) * 180) / Math.PI;
}

// ─── Default view ─────────────────────────────────────────────────────────────

const DEFAULT = { lng: -122.33, lat: 37.77, zoom: 11 };
const ZOOM_MIN = 9;
const ZOOM_MAX = 15;

// ─── Community hotspot zones ──────────────────────────────────────────────────
// Anchored to actual user coordinate clusters; latR/lngR are degree radii

const HOTSPOTS = [
  {
    id: "ai-builders",
    label: "AI Builders",
    lat: 37.776,
    lng: -122.404,
    latR: 0.026,
    lngR: 0.022,
    color: "#8BB8A8",      // sage
    labelColor: "#2A8070",
  },
  {
    id: "creative-district",
    label: "Creative District",
    lat: 37.763,
    lng: -122.416,
    latR: 0.018,
    lngR: 0.018,
    color: "#B8A9D4",      // lavender
    labelColor: "#6858A8",
  },
  {
    id: "coffee-scene",
    label: "Coffee Scene",
    lat: 37.769,
    lng: -122.432,
    latR: 0.014,
    lngR: 0.016,
    color: "#F4A07A",      // warm coral
    labelColor: "#B86030",
  },
  {
    id: "oakland-creatives",
    label: "Oakland Creatives",
    lat: 37.821,
    lng: -122.266,
    latR: 0.024,
    lngR: 0.020,
    color: "#D4B54A",      // golden yellow
    labelColor: "#886800",
  },
  {
    id: "fitness-community",
    label: "Fitness Community",
    lat: 37.830,
    lng: -122.250,
    latR: 0.022,
    lngR: 0.016,
    color: "#7EB5D0",      // dusty blue
    labelColor: "#2E70A0",
  },
] as const;

// ─── Marker spread (push overlapping markers apart) ──────────────────────────

interface MarkerPos {
  user: User;
  x: number;
  y: number;
  ox: number;
  oy: number;
}

function spreadMarkers(
  users: User[],
  projFn: (lng: number, lat: number) => { x: number; y: number }
): MarkerPos[] {
  const MIN_DIST = 60; // px — 56px character + 4px gap

  const items: MarkerPos[] = users.map((user) => {
    const { x, y } = projFn(user.coordinates.lng, user.coordinates.lat);
    return { user, x, y, ox: 0, oy: 0 };
  });

  for (let iter = 0; iter < 4; iter++) {
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const ax = items[i].x + items[i].ox;
        const ay = items[i].y + items[i].oy;
        const bx = items[j].x + items[j].ox;
        const by = items[j].y + items[j].oy;
        const d = Math.hypot(ax - bx, ay - by);
        if (d < MIN_DIST && d > 0.001) {
          const push = (MIN_DIST - d) / 2;
          const nx = (bx - ax) / d;
          const ny = (by - ay) / d;
          items[i].ox -= nx * push;
          items[i].oy -= ny * push;
          items[j].ox += nx * push;
          items[j].oy += ny * push;
        }
      }
    }
  }

  return items;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CoveMap({ users, filterFn }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1160, h: 900 });
  const [view, setView] = useState(DEFAULT);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const visibleUsers = filterFn ? users.filter(filterFn) : users;

  // Keep refs current so native event handlers always see latest values
  const viewRef = useRef(view);
  viewRef.current = view;
  const sizeRef = useRef(size);
  sizeRef.current = size;

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => {
      setSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    obs.observe(el);
    setSize({ w: el.offsetWidth, h: el.offsetHeight });
    return () => obs.disconnect();
  }, []);

  // Native pointer + wheel listeners — bypasses React synthetic event quirks
  useEffect(() => {
    if (!containerRef.current) return;
    const el: HTMLDivElement = containerRef.current;

    let pending: { x: number; y: number; lng: number; lat: number; zoom: number; pid: number } | null = null;
    let dragging = false;
    let moved = false;

    function onDown(e: PointerEvent) {
      if (e.button !== 0) return;
      pending = {
        x: e.clientX, y: e.clientY,
        lng: viewRef.current.lng, lat: viewRef.current.lat,
        zoom: viewRef.current.zoom, pid: e.pointerId,
      };
      moved = false;
    }

    function onMove(e: PointerEvent) {
      if (!pending || e.pointerId !== pending.pid) return;
      const dx = e.clientX - pending.x;
      const dy = e.clientY - pending.y;
      if (!dragging && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      if (!dragging) {
        el.setPointerCapture(e.pointerId);
        dragging = true;
        setIsDragging(true);
      }
      moved = true;
      const z = pending.zoom;
      setView((v) => ({
        zoom: v.zoom,
        lng: toLng(wx(pending!.lng, z) - dx, z),
        lat: toLat(wy(pending!.lat, z) - dy, z),
      }));
    }

    function onUp() {
      if (moved) {
        el.addEventListener(
          "click",
          (ev) => { ev.stopPropagation(); },
          { capture: true, once: true }
        );
      }
      pending = null;
      dragging = false;
      moved = false;
      setIsDragging(false);
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const v = viewRef.current;
      const s = sizeRef.current;
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const dz = e.deltaY < 0 ? 0.4 : -0.4;
      const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, v.zoom + dz));
      if (newZoom === v.zoom) return;
      const z = v.zoom;
      const cxW = wx(v.lng, z) + (cx - s.w / 2);
      const cyW = wy(v.lat, z) + (cy - s.h / 2);
      const sc = 2 ** (newZoom - z);
      setView({
        lng: toLng(cxW * sc - (cx - s.w / 2), newZoom),
        lat: toLat(cyW * sc - (cy - s.h / 2), newZoom),
        zoom: newZoom,
      });
    }

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Zoom buttons
  const zoomBy = useCallback((delta: number) => {
    setView((v) => ({ ...v, zoom: Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, v.zoom + delta)) }));
  }, []);

  const resetView = useCallback(() => setView(DEFAULT), []);

  // Project lat/lng → container pixel
  function proj(lng: number, lat: number) {
    const z = view.zoom;
    return {
      x: wx(lng, z) - wx(view.lng, z) + size.w / 2,
      y: wy(lat, z) - wy(view.lat, z) + size.h / 2,
    };
  }

  // Compute spread marker positions
  const markerPositions = spreadMarkers(visibleUsers, proj);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        background: "linear-gradient(160deg, #F2EAE0 0%, #EDE6DC 45%, #E6DED2 100%)",
      }}
    >
      {/* ── Hotspot blobs (CSS radial-gradient divs, re-projected each render) ── */}
      {HOTSPOTS.map((h) => {
        const c  = proj(h.lng, h.lat);
        const ex = proj(h.lng + h.lngR, h.lat);
        const ey = proj(h.lng, h.lat + h.latR);
        const rx = Math.abs(ex.x - c.x);
        const ry = Math.abs(c.y - ey.y);
        return (
          <div
            key={h.id}
            className="absolute pointer-events-none"
            style={{
              left: c.x - rx,
              top: c.y - ry,
              width: rx * 2,
              height: ry * 2,
              borderRadius: "50%",
              background: `radial-gradient(ellipse at center, ${h.color}70 0%, ${h.color}30 48%, ${h.color}00 100%)`,
              zIndex: 1,
            }}
          />
        );
      })}

      {/* ── Dot grid (softer than lines) ─────────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 2, opacity: 0.30 }}
      >
        <defs>
          <pattern id="map-dots" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="1" fill="#BDB0A0" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#map-dots)" />
      </svg>

      {/* ── Neighbourhood geographic labels ──────────────────────────────────── */}
      {[
        { label: "Mission",      x: "19%", y: "65%" },
        { label: "SoMa",         x: "32%", y: "44%" },
        { label: "Castro",       x: "20%", y: "50%" },
        { label: "Hayes Valley", x: "26%", y: "38%" },
        { label: "Marina",       x: "14%", y: "17%" },
        { label: "Temescal",     x: "70%", y: "20%" },
        { label: "Fruitvale",    x: "77%", y: "61%" },
        { label: "Lake Merritt", x: "65%", y: "38%" },
        { label: "Rockridge",    x: "73%", y: "10%" },
        { label: "Excelsior",    x: "18%", y: "82%" },
      ].map(({ label, x, y }) => (
        <span
          key={label}
          className="absolute pointer-events-none select-none"
          style={{
            left: x, top: y,
            transform: "translate(-50%,-50%)",
            fontSize: 9,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.10em",
            color: "#A89880",
            opacity: 0.55,
            zIndex: 3,
          }}
        >
          {label}
        </span>
      ))}

      {/* ── Community identity labels (positioned via proj) ───────────────────── */}
      {HOTSPOTS.map((h) => {
        const c = proj(h.lng, h.lat);
        if (c.x < -140 || c.x > size.w + 140 || c.y < -30 || c.y > size.h + 30) return null;
        return (
          <span
            key={h.id}
            className="absolute pointer-events-none select-none"
            style={{
              left: c.x,
              top: c.y,
              transform: "translate(-50%, -50%)",
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.05em",
              color: h.labelColor,
              background: `${h.color}30`,
              border: `1px solid ${h.color}55`,
              borderRadius: 100,
              padding: "2px 9px",
              whiteSpace: "nowrap",
              zIndex: 4,
            }}
          >
            {h.label}
          </span>
        );
      })}

      {/* ── User markers ─────────────────────────────────────────────────────── */}
      {markerPositions.map(({ user, x, y, ox, oy }) => {
        const px = x + ox;
        const py = y + oy;
        if (px < -80 || px > size.w + 80 || py < -100 || py > size.h + 40) return null;
        const isSelected = selectedUser?.id === user.id;
        return (
          <div
            key={user.id}
            className="map-marker absolute"
            style={{
              left: px,
              top: py,
              transform: "translate(-50%, -85%)",
              zIndex: isSelected ? 30 : 10,
              pointerEvents: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              filter: isSelected
                ? "drop-shadow(0 0 8px rgba(244,122,92,0.65)) drop-shadow(0 2px 10px rgba(0,0,0,0.18))"
                : "drop-shadow(0 2px 8px rgba(0,0,0,0.12))",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser((p) => (p?.id === user.id ? null : user));
            }}
          >
            {/* Circular adventurer avatar */}
            <div style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              overflow: "hidden",
              border: `2.5px solid ${isSelected ? "#F47A5C" : "rgba(255,255,255,0.95)"}`,
              boxShadow: isSelected
                ? "0 0 0 2px rgba(244,122,92,0.30)"
                : "0 2px 10px rgba(0,0,0,0.14)",
              flexShrink: 0,
            }}>
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                width={48}
                height={48}
                alt=""
                draggable={false}
                style={{ display: "block", pointerEvents: "none", userSelect: "none" }}
              />
            </div>
            {/* Name label */}
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                lineHeight: "1.2",
                color: "#2F2A26",
                background: isSelected ? "#FFF0EE" : "rgba(255,253,252,0.94)",
                border: `1.5px solid ${isSelected ? "#F47A5C" : "rgba(0,0,0,0.06)"}`,
                borderRadius: 8,
                padding: "2px 6px",
                marginTop: 2,
                boxShadow: "0 1px 6px rgba(0,0,0,0.10)",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {user.availability === "Open to Meet" && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#43D09F",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
              )}
              {user.name.split(" ")[0]}
            </div>
          </div>
        );
      })}

      {/* Dismiss selected user on background click */}
      {selectedUser && (
        <div
          className="absolute inset-0"
          style={{ zIndex: 5, pointerEvents: "auto" }}
          onClick={() => setSelectedUser(null)}
        />
      )}

      {/* Profile card */}
      {selectedUser && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
          <ProfileCard user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-6 right-5 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => zoomBy(0.75)}
          className="w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center text-[#2F2A26] hover:bg-[#FEEEEA] hover:text-[#F47A5C] transition-colors border border-[#E9E3DB]"
          aria-label="Zoom in"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={() => zoomBy(-0.75)}
          className="w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center text-[#2F2A26] hover:bg-[#FEEEEA] hover:text-[#F47A5C] transition-colors border border-[#E9E3DB]"
          aria-label="Zoom out"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={resetView}
          className="w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center text-[#2F2A26] hover:bg-[#FEEEEA] hover:text-[#F47A5C] transition-colors border border-[#E9E3DB]"
          aria-label="Reset view"
        >
          <Locate size={14} />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-[#6E6A65] shadow-sm border border-white/60 flex items-center gap-1.5">
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#43D09F", display: "inline-block" }} />
          Open to Meet
        </div>
        {/* Hotspot color key */}
        <div className="bg-white/85 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm border border-white/60 flex flex-col gap-1">
          {HOTSPOTS.map((h) => (
            <div key={h.id} className="flex items-center gap-1.5">
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: h.color, display: "inline-block", flexShrink: 0,
              }} />
              <span style={{ fontSize: 9, color: h.labelColor, fontWeight: 500, whiteSpace: "nowrap" }}>
                {h.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
