"use client";
import { useEffect, useRef, useState } from "react";
import type { User } from "@/lib/types";
import { getInitials, getAvatarColor, cn } from "@/lib/utils";
import ProfileCard from "@/components/profile/ProfileCard";

interface Props {
  users: User[];
  filterFn?: (user: User) => boolean;
}

export default function CoveMap({ users, filterFn }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const visibleUsers = filterFn ? users.filter(filterFn) : users;

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || token === "your_mapbox_token_here") {
      setMapError(true);
      return;
    }

    let map: unknown;
    let isMounted = true;

    const initMap = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (!isMounted || !mapContainer.current) return;

        (mapboxgl as { accessToken: string }).accessToken = token;
        map = new (mapboxgl as unknown as { Map: new (opts: unknown) => unknown }).Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [-122.4194, 37.7749],
          zoom: 11.5,
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
      if (map) (map as { remove: () => void }).remove();
    };
  }, []);

  if (mapError) {
    return <MapFallback users={visibleUsers} onSelectUser={setSelectedUser} selectedUser={selectedUser} />;
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {mapLoaded && visibleUsers.map((user) => {
        return (
          <div
            key={user.id}
            className="absolute pointer-events-none"
            style={{ left: "50%", top: "50%" }}
          >
          </div>
        );
      })}

      {!mapLoaded && (
        <div className="absolute inset-0 bg-[#FAFAF7] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#E8734A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#737373]">Loading map…</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MapFallback({ users, onSelectUser, selectedUser }: {
  users: User[];
  onSelectUser: (u: User | null) => void;
  selectedUser: User | null;
}) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#E8F4F8] via-[#EEF2E6] to-[#F5EDDF] overflow-hidden">
      {/* Grid lines to simulate a map */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4A7C6F" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {/* Streets */}
        <line x1="0" y1="35%" x2="100%" y2="33%" stroke="#B8C8B0" strokeWidth="2" opacity="0.6"/>
        <line x1="0" y1="55%" x2="100%" y2="57%" stroke="#B8C8B0" strokeWidth="1.5" opacity="0.5"/>
        <line x1="0" y1="72%" x2="100%" y2="70%" stroke="#B8C8B0" strokeWidth="1" opacity="0.4"/>
        <line x1="20%" y1="0" x2="22%" y2="100%" stroke="#B8C8B0" strokeWidth="2" opacity="0.6"/>
        <line x1="45%" y1="0" x2="43%" y2="100%" stroke="#B8C8B0" strokeWidth="1.5" opacity="0.5"/>
        <line x1="70%" y1="0" x2="72%" y2="100%" stroke="#B8C8B0" strokeWidth="2" opacity="0.6"/>
        {/* Park block */}
        <rect x="24%" y="38%" width="17%" height="14%" rx="4" fill="#C8DCBA" opacity="0.4"/>
      </svg>

      {/* Neighborhood labels */}
      {[
        { label: "Mission", x: "20%", y: "65%" },
        { label: "SoMa", x: "45%", y: "45%" },
        { label: "Castro", x: "22%", y: "50%" },
        { label: "Hayes Valley", x: "32%", y: "40%" },
        { label: "Marina", x: "15%", y: "18%" },
        { label: "Temescal", x: "72%", y: "20%" },
        { label: "Fruitvale", x: "80%", y: "60%" },
        { label: "Lake Merritt", x: "68%", y: "38%" },
      ].map(({ label, x, y }) => (
        <span
          key={label}
          className="absolute text-[10px] font-semibold text-[#5A7A70] uppercase tracking-widest pointer-events-none select-none"
          style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
        >
          {label}
        </span>
      ))}

      {/* User markers scattered across the map */}
      {users.map((user, i) => {
        const positions = [
          { x: "18%", y: "62%" }, { x: "34%", y: "38%" }, { x: "22%", y: "48%" },
          { x: "75%", y: "22%" }, { x: "48%", y: "42%" }, { x: "60%", y: "55%" },
          { x: "27%", y: "65%" }, { x: "82%", y: "62%" }, { x: "24%", y: "46%" },
          { x: "73%", y: "40%" }, { x: "16%", y: "20%" }, { x: "66%", y: "35%" },
          { x: "50%", y: "62%" }, { x: "85%", y: "38%" }, { x: "38%", y: "55%" },
          { x: "44%", y: "28%" }, { x: "55%", y: "30%" }, { x: "25%", y: "55%" },
          { x: "62%", y: "68%" }, { x: "78%", y: "48%" }, { x: "46%", y: "50%" },
          { x: "52%", y: "44%" }, { x: "70%", y: "58%" }, { x: "35%", y: "28%" },
          { x: "20%", y: "70%" }, { x: "88%", y: "28%" }, { x: "82%", y: "20%" },
          { x: "40%", y: "22%" }, { x: "58%", y: "72%" }, { x: "30%", y: "78%" },
        ];
        const pos = positions[i % positions.length];
        return (
          <button
            key={user.id}
            onClick={() => onSelectUser(selectedUser?.id === user.id ? null : user)}
            className={cn(
              "absolute flex items-center justify-center w-10 h-10 rounded-full border-2 border-white shadow-lg transition-all hover:scale-110 z-10 text-white text-xs font-bold cursor-pointer",
              getAvatarColor(user.name),
              user.streakCount >= 7 ? "streak-glow" : "",
              selectedUser?.id === user.id ? "scale-125 z-20 ring-2 ring-[#E8734A] ring-offset-2" : ""
            )}
            style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
            title={user.name}
          >
            {getInitials(user.name)}
            {user.availability === "Open to Meet" && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#7B9E87] rounded-full border-2 border-white" />
            )}
          </button>
        );
      })}

      {/* Popup */}
      {selectedUser && (
        <div
          className="absolute z-30 transition-all"
          style={{ left: "50%", top: "50%", transform: "translate(-50%, -120%)" }}
        >
          <ProfileCard
            user={selectedUser}
            onClose={() => onSelectUser(null)}
          />
        </div>
      )}

      {/* Map watermark */}
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-[#737373]">
        📍 San Francisco + Oakland · {users.length} people nearby
      </div>

      {/* Token notice */}
      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
        <div className="absolute top-4 right-4 bg-[#FDF0EB] border border-[#F4CFBC] rounded-xl px-3 py-2 text-xs text-[#B35C2E] max-w-xs">
          Add <code className="font-mono">NEXT_PUBLIC_MAPBOX_TOKEN</code> to .env.local to enable the live map.
        </div>
      )}
    </div>
  );
}
