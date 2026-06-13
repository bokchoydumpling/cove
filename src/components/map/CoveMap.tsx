"use client";
import { useEffect, useRef, useState } from "react";
import type { User } from "@/lib/types";
import { getInitials, getAvatarColor, cn } from "@/lib/utils";
import ProfileCard from "@/components/profile/ProfileCard";

interface Props {
  users: User[];
  filterFn?: (user: User) => boolean;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const TOKEN_IS_PLACEHOLDER =
  !MAPBOX_TOKEN ||
  MAPBOX_TOKEN === "your_mapbox_token_here" ||
  MAPBOX_TOKEN.startsWith("your_");

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
function getAvatarHex(name: string): string {
  return AVATAR_HEX[getAvatarColor(name)] ?? "#E8734A";
}

export default function CoveMap({ users, filterFn }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mapReadyVersion, setMapReadyVersion] = useState(0);
  const mapboxReady = mapReadyVersion > 0;
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // Pixel positions for every user, keyed by id. Updated on map move/zoom.
  const [markerPixels, setMarkerPixels] = useState<Record<string, { x: number; y: number }>>({});

  const visibleUsers = filterFn ? users.filter(filterFn) : users;

  // Initialise Mapbox in the background.
  useEffect(() => {
    if (TOKEN_IS_PLACEHOLDER) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (!isMounted || !mapContainer.current) return;

        (mapboxgl as unknown as { accessToken: string }).accessToken = MAPBOX_TOKEN;

        const map = new (
          mapboxgl as unknown as { Map: new (o: unknown) => unknown }
        ).Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [-122.4194, 37.7749],
          zoom: 12,
          attributionControl: false,
        });

        mapRef.current = map;

        (map as { on: (e: string, cb: () => void) => void }).on("load", () => {
          if (!isMounted) return;
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setMapReadyVersion((v) => v + 1);
        });

        (map as { on: (e: string, cb: (e?: unknown) => void) => void }).on(
          "error",
          (e) => {
            console.warn("[Cove] Mapbox error — staying on fallback map:", e);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }
        );

        timeoutRef.current = setTimeout(() => {
          if (!isMounted) return;
          console.warn("[Cove] Mapbox load timed out — staying on fallback map");
        }, 8000);
      } catch (err) {
        console.warn("[Cove] Mapbox failed to initialise:", err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (mapRef.current) (mapRef.current as { remove: () => void }).remove();
    };
  }, []);

  // Project every user's lat/lng to canvas pixels.
  // Runs once on map load, then re-runs on every map move so markers track the
  // viewport. We project ALL users (not just visible) so that filter toggles
  // instantly show/hide markers without waiting for a re-projection.
  useEffect(() => {
    if (mapReadyVersion === 0 || !mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapRef.current as any;

    const project = () => {
      const pixels: Record<string, { x: number; y: number }> = {};
      users.forEach((user) => {
        const pt = map.project([user.coordinates.lng, user.coordinates.lat]);
        pixels[user.id] = { x: Math.round(pt.x), y: Math.round(pt.y) };
      });
      setMarkerPixels(pixels);
    };

    project();
    map.on("move", project);

    return () => {
      map.off("move", project);
    };
  }, [mapReadyVersion, users]);

  return (
    <div className="relative w-full h-full">
      {/* Fallback — visible until Mapbox is ready */}
      <div className={cn("absolute inset-0 transition-opacity duration-500", mapboxReady ? "opacity-0 pointer-events-none" : "opacity-100")}>
        <MapFallback
          users={visibleUsers}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />
      </div>

      {/* Mapbox canvas + React marker overlay */}
      {!TOKEN_IS_PLACEHOLDER && (
        <div className={cn("absolute inset-0 transition-opacity duration-500", mapboxReady ? "opacity-100" : "opacity-0 pointer-events-none")}>
          <div ref={mapContainer} className="w-full h-full" />

          {/* Avatar circles positioned by projected lat/lng */}
          {mapboxReady && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                pointerEvents: "none",
              }}
            >
              {visibleUsers.map((user) => {
                const pos = markerPixels[user.id];
                if (!pos) return null;
                const isSelected = selectedUser?.id === user.id;
                const hex = getAvatarHex(user.name);
                return (
                  <button
                    key={user.id}
                    onClick={() =>
                      setSelectedUser((prev) =>
                        prev?.id === user.id ? null : user
                      )
                    }
                    title={`${user.name} · ${user.profession}`}
                    style={{
                      position: "absolute",
                      left: pos.x,
                      top: pos.y,
                      transform: "translate(-50%, -50%)",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: hex,
                      border: isSelected
                        ? "2.5px solid #E8734A"
                        : "2.5px solid white",
                      boxShadow: isSelected
                        ? "0 0 0 3px rgba(232,115,74,0.35), 0 4px 16px rgba(0,0,0,0.2)"
                        : "0 2px 10px rgba(0,0,0,0.18)",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily:
                        "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
                      cursor: "pointer",
                      pointerEvents: "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: isSelected ? 20 : 10,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLButtonElement).style.transform =
                          "translate(-50%, -50%) scale(1.15)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLButtonElement).style.transform =
                          "translate(-50%, -50%)";
                    }}
                  >
                    {getInitials(user.name)}
                    {user.availability === "Open to Meet" && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: -1,
                          right: -1,
                          width: 12,
                          height: 12,
                          background: "#7B9E87",
                          borderRadius: "50%",
                          border: "2px solid white",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {mapboxReady && selectedUser && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
              <ProfileCard
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Fallback map (illustration + CSS-positioned markers) ────────────────────

const MARKER_POSITIONS = [
  { x: "18%", y: "62%" }, { x: "34%", y: "36%" }, { x: "22%", y: "47%" },
  { x: "75%", y: "22%" }, { x: "48%", y: "41%" }, { x: "60%", y: "54%" },
  { x: "27%", y: "63%" }, { x: "82%", y: "58%" }, { x: "24%", y: "44%" },
  { x: "73%", y: "39%" }, { x: "16%", y: "22%" }, { x: "66%", y: "32%" },
  { x: "50%", y: "60%" }, { x: "85%", y: "36%" }, { x: "38%", y: "53%" },
  { x: "44%", y: "27%" }, { x: "55%", y: "29%" }, { x: "25%", y: "53%" },
  { x: "62%", y: "66%" }, { x: "78%", y: "46%" }, { x: "46%", y: "48%" },
  { x: "52%", y: "43%" }, { x: "70%", y: "56%" }, { x: "35%", y: "27%" },
  { x: "20%", y: "68%" }, { x: "88%", y: "26%" }, { x: "82%", y: "18%" },
  { x: "40%", y: "21%" }, { x: "58%", y: "70%" }, { x: "30%", y: "75%" },
];

function MapFallback({
  users,
  selectedUser,
  onSelectUser,
}: {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (u: User | null) => void;
}) {
  const [popupPos, setPopupPos] = useState<{ x: string; y: string } | null>(null);

  const handleSelect = (user: User, x: string, y: string) => {
    if (selectedUser?.id === user.id) {
      onSelectUser(null);
      setPopupPos(null);
    } else {
      onSelectUser(user);
      setPopupPos({ x, y });
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#E8F4F8] via-[#EEF2E6] to-[#F5EDDF]">
      {/* Faint street grid */}
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
        <line x1="0" y1="72%" x2="100%" y2="70%" stroke="#B8C8B0" strokeWidth="1" opacity="0.3" />
        <line x1="20%" y1="0" x2="22%" y2="100%" stroke="#B8C8B0" strokeWidth="2" opacity="0.5" />
        <line x1="45%" y1="0" x2="43%" y2="100%" stroke="#B8C8B0" strokeWidth="1.5" opacity="0.4" />
        <line x1="70%" y1="0" x2="72%" y2="100%" stroke="#B8C8B0" strokeWidth="2" opacity="0.5" />
        <rect x="24%" y="38%" width="17%" height="14%" rx="4" fill="#C8DCBA" opacity="0.35" />
      </svg>

      {/* Neighbourhood labels */}
      {[
        { label: "Mission",      x: "20%", y: "65%" },
        { label: "SoMa",         x: "45%", y: "44%" },
        { label: "Castro",       x: "22%", y: "50%" },
        { label: "Hayes Valley", x: "33%", y: "39%" },
        { label: "Marina",       x: "15%", y: "17%" },
        { label: "Temescal",     x: "72%", y: "19%" },
        { label: "Fruitvale",    x: "80%", y: "62%" },
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

      {/* User markers */}
      {users.map((user, i) => {
        const pos = MARKER_POSITIONS[i % MARKER_POSITIONS.length];
        const isSelected = selectedUser?.id === user.id;
        const hex = getAvatarHex(user.name);
        return (
          <button
            key={user.id}
            onClick={() => handleSelect(user, pos.x, pos.y)}
            title={`${user.name} · ${user.profession}`}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%,-50%)",
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: hex,
              border: isSelected ? "2.5px solid #E8734A" : "2.5px solid white",
              boxShadow: isSelected
                ? "0 0 0 3px rgba(232,115,74,0.35), 0 4px 16px rgba(0,0,0,0.2)"
                : "0 2px 10px rgba(0,0,0,0.18)",
              color: "white",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
              cursor: "pointer",
              zIndex: isSelected ? 20 : 10,
              transition: "transform 0.15s, box-shadow 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) (e.currentTarget as HTMLButtonElement).style.transform = "translate(-50%,-50%) scale(1.15)";
            }}
            onMouseLeave={(e) => {
              if (!isSelected) (e.currentTarget as HTMLButtonElement).style.transform = "translate(-50%,-50%)";
            }}
          >
            {getInitials(user.name)}
            {user.availability === "Open to Meet" && (
              <span
                style={{
                  position: "absolute",
                  bottom: -1,
                  right: -1,
                  width: 12,
                  height: 12,
                  background: "#7B9E87",
                  borderRadius: "50%",
                  border: "2px solid white",
                  pointerEvents: "none",
                }}
              />
            )}
          </button>
        );
      })}

      {/* Profile card popup */}
      {selectedUser && popupPos && (
        <FallbackPopup
          user={selectedUser}
          anchorX={popupPos.x}
          anchorY={popupPos.y}
          onClose={() => { onSelectUser(null); setPopupPos(null); }}
        />
      )}

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="bg-white/85 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-[#737373] shadow-sm border border-white/60">
          📍 San Francisco + Oakland &nbsp;·&nbsp;
          <span className="font-semibold text-[#1A1A1A]">{users.length}</span> people nearby
        </div>
        <div className="bg-white/85 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-[#737373] shadow-sm border border-white/60 flex items-center gap-1.5">
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7B9E87", display: "inline-block" }} />
          Open to Meet
        </div>
      </div>
    </div>
  );
}

function FallbackPopup({
  user,
  anchorX,
  anchorY,
  onClose,
}: {
  user: User;
  anchorX: string;
  anchorY: string;
  onClose: () => void;
}) {
  const yPct = parseFloat(anchorY);
  const showAbove = yPct > 45;

  return (
    <div
      style={{
        position: "absolute",
        left: anchorX,
        top: anchorY,
        transform: showAbove
          ? "translate(-50%, calc(-100% - 24px))"
          : "translate(-50%, 24px)",
        zIndex: 30,
      }}
    >
      <ProfileCard user={user} onClose={onClose} />
    </div>
  );
}
