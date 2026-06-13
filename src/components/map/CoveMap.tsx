"use client";
import { useEffect, useRef, useState } from "react";
import type { User } from "@/lib/types";
import { getInitials, getAvatarColor, cn } from "@/lib/utils";
import ProfileCard from "@/components/profile/ProfileCard";

interface Props {
  users: User[];
  filterFn?: (user: User) => boolean;
}

// Returns a hex color for inline styles (Mapbox markers can't use Tailwind classes)
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
  const mapboxglRef = useRef<unknown>(null);
  const markersRef = useRef<Array<{ remove: () => void }>>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const visibleUsers = filterFn ? users.filter(filterFn) : users;

  // Init Mapbox
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || token === "your_mapbox_token_here") {
      setMapError(true);
      return;
    }

    let isMounted = true;

    const initMap = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (!isMounted || !mapContainer.current) return;

        mapboxglRef.current = mapboxgl;
        (mapboxgl as unknown as { accessToken: string }).accessToken = token;

        const map = new (mapboxgl as unknown as {
          Map: new (opts: unknown) => unknown;
        }).Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [-122.4194, 37.7749],
          zoom: 12,
          attributionControl: false,
        });

        mapRef.current = map;
        (map as { on: (e: string, cb: () => void) => void }).on("load", () => {
          if (isMounted) setMapLoaded(true);
        });
      } catch {
        if (isMounted) setMapError(true);
      }
    };

    initMap();
    return () => {
      isMounted = false;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapRef.current) (mapRef.current as { remove: () => void }).remove();
    };
  }, []);

  // Add / refresh markers whenever the map is loaded or visible users change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !mapboxglRef.current) return;

    const map = mapRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapboxgl = mapboxglRef.current as any;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    visibleUsers.forEach((user) => {
      const hex = getAvatarHex(user.name);
      const initials = getInitials(user.name);

      // Outer wrapper (relative so the green dot can be absolute inside)
      const wrapper = document.createElement("div");
      wrapper.style.cssText = "position:relative;width:40px;height:40px;cursor:pointer;";

      const btn = document.createElement("button");
      btn.style.cssText = [
        `background:${hex}`,
        "width:40px",
        "height:40px",
        "border-radius:50%",
        "border:2.5px solid white",
        "box-shadow:0 2px 10px rgba(0,0,0,0.18)",
        "color:white",
        "font-size:12px",
        "font-weight:700",
        "display:flex",
        "align-items:center",
        "justify-content:center",
        "cursor:pointer",
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        "transition:transform 0.15s ease,box-shadow 0.15s ease",
      ].join(";");
      btn.textContent = initials;

      btn.addEventListener("mouseenter", () => {
        btn.style.transform = "scale(1.15)";
        btn.style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "scale(1)";
        btn.style.boxShadow = "0 2px 10px rgba(0,0,0,0.18)";
      });
      btn.addEventListener("click", () => {
        setSelectedUser((prev) => (prev?.id === user.id ? null : user));
      });

      wrapper.appendChild(btn);

      // Green dot for "Open to Meet"
      if (user.availability === "Open to Meet") {
        const dot = document.createElement("span");
        dot.style.cssText =
          "position:absolute;bottom:-1px;right:-1px;width:12px;height:12px;background:#7B9E87;border-radius:50%;border:2px solid white;";
        wrapper.appendChild(dot);
      }

      const marker = new mapboxgl.Marker({ element: wrapper, anchor: "center" })
        .setLngLat([user.coordinates.lng, user.coordinates.lat])
        .addTo(map);

      markersRef.current.push(marker as { remove: () => void });
    });
  }, [mapLoaded, visibleUsers]);

  if (mapError) {
    return (
      <MapFallback
        users={visibleUsers}
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {!mapLoaded && (
        <div className="absolute inset-0 bg-[#FAFAF7] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#E8734A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#737373]">Loading map…</p>
          </div>
        </div>
      )}

      {/* Profile card popup — fixed overlay so it's always readable */}
      {selectedUser && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <ProfileCard user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
      )}
    </div>
  );
}

// --- Fallback map (no Mapbox token) ---

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
      {/* Faint grid */}
      <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4A7C6F" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <line x1="0" y1="35%" x2="100%" y2="33%" stroke="#B8C8B0" strokeWidth="2" opacity="0.6" />
        <line x1="0" y1="55%" x2="100%" y2="57%" stroke="#B8C8B0" strokeWidth="1.5" opacity="0.5" />
        <line x1="0" y1="72%" x2="100%" y2="70%" stroke="#B8C8B0" strokeWidth="1" opacity="0.4" />
        <line x1="20%" y1="0" x2="22%" y2="100%" stroke="#B8C8B0" strokeWidth="2" opacity="0.6" />
        <line x1="45%" y1="0" x2="43%" y2="100%" stroke="#B8C8B0" strokeWidth="1.5" opacity="0.5" />
        <line x1="70%" y1="0" x2="72%" y2="100%" stroke="#B8C8B0" strokeWidth="2" opacity="0.6" />
        <rect x="24%" y="38%" width="17%" height="14%" rx="4" fill="#C8DCBA" opacity="0.4" />
      </svg>

      {/* Neighborhood labels */}
      {[
        { label: "Mission", x: "20%", y: "65%" },
        { label: "SoMa", x: "45%", y: "44%" },
        { label: "Castro", x: "22%", y: "50%" },
        { label: "Hayes Valley", x: "33%", y: "39%" },
        { label: "Marina", x: "15%", y: "17%" },
        { label: "Temescal", x: "72%", y: "19%" },
        { label: "Fruitvale", x: "80%", y: "62%" },
        { label: "Lake Merritt", x: "67%", y: "37%" },
      ].map(({ label, x, y }) => (
        <span
          key={label}
          className="absolute text-[9px] font-bold text-[#5A7A70] uppercase tracking-widest pointer-events-none select-none opacity-60"
          style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
        >
          {label}
        </span>
      ))}

      {/* User markers */}
      {users.map((user, i) => {
        const pos = MARKER_POSITIONS[i % MARKER_POSITIONS.length];
        const isSelected = selectedUser?.id === user.id;
        return (
          <button
            key={user.id}
            onClick={() => handleSelect(user, pos.x, pos.y)}
            className={cn(
              "absolute flex items-center justify-center w-10 h-10 rounded-full border-2 border-white shadow-lg text-white text-xs font-bold cursor-pointer transition-all duration-150",
              getAvatarColor(user.name),
              user.streakCount >= 7 ? "streak-glow" : "",
              isSelected
                ? "scale-125 z-20 ring-2 ring-[#E8734A] ring-offset-1 shadow-xl"
                : "z-10 hover:scale-110 hover:shadow-xl hover:z-10"
            )}
            style={{ left: pos.x, top: pos.y, transform: isSelected ? "translate(-50%, -50%) scale(1.25)" : "translate(-50%, -50%)" }}
            title={`${user.name} · ${user.profession}`}
          >
            {getInitials(user.name)}
            {user.availability === "Open to Meet" && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#7B9E87] rounded-full border-2 border-white pointer-events-none" />
            )}
          </button>
        );
      })}

      {/* Profile card popup — positioned near the clicked marker, but clamped to screen */}
      {selectedUser && popupPos && (
        <PopupOverlay
          user={selectedUser}
          anchorX={popupPos.x}
          anchorY={popupPos.y}
          onClose={() => { onSelectUser(null); setPopupPos(null); }}
        />
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-3">
        <div className="bg-white/85 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-[#737373] shadow-sm">
          📍 San Francisco + Oakland · <span className="font-semibold text-[#1A1A1A]">{users.length}</span> people nearby
        </div>
        <div className="bg-white/85 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-[#737373] shadow-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#7B9E87] inline-block" />
          Open to Meet
        </div>
      </div>
    </div>
  );
}

function PopupOverlay({
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
  // Parse percentage values to decide whether to flip the popup above or below
  const yPct = parseFloat(anchorY);
  // If marker is in the bottom 40% of the map, show popup above the marker
  // Otherwise show below
  const showAbove = yPct > 45;

  const style: React.CSSProperties = {
    position: "absolute",
    left: anchorX,
    top: anchorY,
    transform: showAbove
      ? "translate(-50%, calc(-100% - 28px))"
      : "translate(-50%, 28px)",
    zIndex: 30,
  };

  return (
    <div style={style}>
      {/* Arrow */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 w-0 h-0",
          showAbove
            ? "bottom-[-8px] border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white"
            : "top-[-8px] border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white"
        )}
      />
      <ProfileCard user={user} onClose={onClose} />
    </div>
  );
}
