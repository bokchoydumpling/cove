"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Avatar from "boring-avatars";
import { Plus, Minus, Locate } from "lucide-react";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
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

// ─── Avatar palette (warm & playful) ─────────────────────────────────────────

export const AVATAR_PALETTE = ["#E8734A", "#F4A574", "#7B9E87", "#9B8EC4", "#6BAED6"];

// ─── Default view ─────────────────────────────────────────────────────────────

const DEFAULT = { lng: -122.33, lat: 37.77, zoom: 11 };
const ZOOM_MIN = 9;
const ZOOM_MAX = 15;

// ─── Component ───────────────────────────────────────────────────────────────

export default function CoveMap({ users, filterFn }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1160, h: 900 });
  const [view, setView] = useState(DEFAULT);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const visibleUsers = filterFn ? users.filter(filterFn) : users;

  // Keep refs current for the non-passive wheel handler
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

  // Non-passive wheel zoom (so we can preventDefault)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
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
      const nz = newZoom;
      setView({
        lng: toLng(cxW * sc - (cx - s.w / 2), nz),
        lat: toLat(cyW * sc - (cy - s.h / 2), nz),
        zoom: newZoom,
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // Pan via pointer capture
  const dragStart = useRef<{ x: number; y: number; lng: number; lat: number } | null>(null);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, lng: view.lng, lat: view.lat };
    setIsDragging(true);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const z = view.zoom;
    setView(v => ({
      ...v,
      lng: toLng(wx(dragStart.current!.lng, z) - dx, z),
      lat: toLat(wy(dragStart.current!.lat, z) - dy, z),
    }));
  }

  function onPointerUp() {
    dragStart.current = null;
    setIsDragging(false);
  }

  // Zoom buttons
  const zoomBy = useCallback((delta: number) => {
    setView(v => ({ ...v, zoom: Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, v.zoom + delta)) }));
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

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none", background: "linear-gradient(135deg, #EAF4F0 0%, #EEF2E8 40%, #F5EDDF 100%)" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Subtle background grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
        <defs>
          <pattern id="map-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#4A7C6F" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#map-grid)" />
      </svg>

      {/* Neighbourhood labels (fixed, decorative) */}
      {[
        { label: "Mission", x: "19%", y: "65%" },
        { label: "SoMa", x: "32%", y: "44%" },
        { label: "Castro", x: "20%", y: "50%" },
        { label: "Hayes Valley", x: "26%", y: "38%" },
        { label: "Marina", x: "14%", y: "17%" },
        { label: "Temescal", x: "70%", y: "20%" },
        { label: "Fruitvale", x: "77%", y: "61%" },
        { label: "Lake Merritt", x: "65%", y: "38%" },
        { label: "Rockridge", x: "73%", y: "10%" },
        { label: "Excelsior", x: "18%", y: "82%" },
      ].map(({ label, x, y }) => (
        <span
          key={label}
          className="absolute text-[9px] font-bold uppercase tracking-widest pointer-events-none select-none opacity-40"
          style={{ left: x, top: y, transform: "translate(-50%,-50%)", color: "#4A7C6F" }}
        >
          {label}
        </span>
      ))}

      {/* User markers */}
      {visibleUsers.map((user) => {
        const { x, y } = proj(user.coordinates.lng, user.coordinates.lat);
        // Cull off-screen markers
        if (x < -60 || x > size.w + 60 || y < -60 || y > size.h + 60) return null;
        const isSelected = selectedUser?.id === user.id;
        return (
          <div
            key={user.id}
            className="map-marker absolute"
            style={{
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
              zIndex: isSelected ? 30 : 10,
              pointerEvents: "auto",
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!isDragging) setSelectedUser((p) => (p?.id === user.id ? null : user));
            }}
          >
            <div
              className="map-marker-inner relative"
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                overflow: "hidden",
                border: isSelected ? "3px solid #E8734A" : "2.5px solid white",
                boxShadow: isSelected
                  ? "0 0 0 4px rgba(232,115,74,0.3), 0 6px 20px rgba(0,0,0,0.22)"
                  : "0 2px 12px rgba(0,0,0,0.16)",
              }}
            >
              <Avatar size={46} name={user.name} variant="beam" colors={AVATAR_PALETTE} />
            </div>
            {user.availability === "Open to Meet" && (
              <span
                className="availability-pulse absolute"
                style={{
                  bottom: -1, right: -1,
                  width: 13, height: 13,
                  background: "#43D09F",
                  borderRadius: "50%",
                  border: "2.5px solid white",
                  pointerEvents: "none",
                }}
              />
            )}
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
          className="w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center text-[#3D3D3D] hover:bg-[#FDF0EB] hover:text-[#E8734A] transition-colors border border-[#E8E4DC]"
          aria-label="Zoom in"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={() => zoomBy(-0.75)}
          className="w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center text-[#3D3D3D] hover:bg-[#FDF0EB] hover:text-[#E8734A] transition-colors border border-[#E8E4DC]"
          aria-label="Zoom out"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={resetView}
          className="w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center text-[#3D3D3D] hover:bg-[#FDF0EB] hover:text-[#E8734A] transition-colors border border-[#E8E4DC]"
          aria-label="Reset view"
        >
          <Locate size={14} />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-[#737373] shadow-sm border border-white/60 flex items-center gap-1.5">
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#43D09F", display: "inline-block" }} />
          Open to Meet
        </div>
      </div>
    </div>
  );
}
