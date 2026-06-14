"use client";
import { useAppStore } from "@/store/useAppStore";
import AppShell from "@/components/layout/AppShell";
import CoveMap from "@/components/map/CoveMap";
import MapFilters from "@/components/map/MapFilters";
import type { User } from "@/lib/types";

export default function MapPage() {
  const { users, mapFilter } = useAppStore();

  const filterFn = (user: User): boolean => {
    if (mapFilter.professions.length > 0 && !mapFilter.professions.includes(user.profession)) return false;
    if (mapFilter.interests.length > 0 && !user.interests.some((i) => mapFilter.interests.includes(i))) return false;
    if (mapFilter.lookingFor.length > 0 && !user.lookingFor.some((l) => mapFilter.lookingFor.includes(l))) return false;
    if (mapFilter.availability.length > 0 && !mapFilter.availability.includes(user.availability)) return false;
    return true;
  };

  const visibleCount = users.filter(filterFn).length;

  return (
    <AppShell>
      <div className="relative h-screen overflow-hidden">
        {/* Top filter bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-2">
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
            <MapFilters />
          </div>
          <div className="shrink-0 bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 border border-[#E8E4DC] text-xs text-[#737373] shadow-sm whitespace-nowrap">
            <span className="font-semibold text-[#1A1A1A]">{visibleCount}</span> nearby
          </div>
        </div>

        {/* Map fills the full h-screen parent */}
        <div className="absolute inset-0">
          <CoveMap users={users} filterFn={filterFn} />
        </div>

      </div>
    </AppShell>
  );
}
