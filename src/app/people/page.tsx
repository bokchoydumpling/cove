"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Flame, Star, MapPin } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAppStore } from "@/store/useAppStore";
import { cn, getInitials, getAvatarColor, getProfessionColor } from "@/lib/utils";
import type { Profession, Interest } from "@/lib/types";

const PROF_FILTERS: Profession[] = [
  "Software Engineer","Designer","Founder","Artist","Musician",
  "Photographer","Marketer","Nonprofit","Writer","Fitness","Student","Food Creator",
];
const INTEREST_FILTERS: Interest[] = [
  "AI","Startups","Coffee","Art","Music","Food","Fitness","Photography","Books","Local Events",
];

export default function PeoplePage() {
  const { users } = useAppStore();
  const [search, setSearch] = useState("");
  const [activeProfession, setActiveProfession] = useState<Profession | null>(null);
  const [activeInterest, setActiveInterest] = useState<Interest | null>(null);

  const filtered = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) &&
        !u.bio.toLowerCase().includes(search.toLowerCase()) &&
        !u.currentlyInto.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeProfession && u.profession !== activeProfession) return false;
    if (activeInterest && !u.interests.includes(activeInterest)) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">People</h1>
          <p className="text-[#737373] text-sm mt-1">
            {users.length} interesting people across San Francisco & Oakland
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0ABA3]" />
          <input
            type="text"
            placeholder="Search by name, bio, or what they're into…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8E4DC] rounded-xl text-sm text-[#1A1A1A] placeholder-[#B0ABA3] focus:outline-none focus:ring-2 focus:ring-[#E8734A]/30 focus:border-[#E8734A]"
          />
        </div>

        {/* Profession filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
          {PROF_FILTERS.map((p) => (
            <button
              key={p}
              onClick={() => setActiveProfession(activeProfession === p ? null : p)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                activeProfession === p
                  ? "bg-[#E8734A] text-white border-[#E8734A]"
                  : "bg-white text-[#4A4A4A] border-[#E8E4DC] hover:border-[#E8734A]"
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Interest filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {INTEREST_FILTERS.map((i) => (
            <button
              key={i}
              onClick={() => setActiveInterest(activeInterest === i ? null : i)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                activeInterest === i
                  ? "bg-[#7B9E87] text-white border-[#7B9E87]"
                  : "bg-white text-[#4A4A4A] border-[#E8E4DC] hover:border-[#7B9E87]"
              )}
            >
              {i}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs text-[#B0ABA3] mb-4">{filtered.length} people</p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((user) => {
            const profColor = getProfessionColor(user.profession);
            return (
              <Link key={user.id} href={`/profile/${user.id}`}>
                <div className="bg-white rounded-2xl border border-[#E8E4DC] p-4 hover-lift cursor-pointer">
                  {/* Avatar + name */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                      <div
                        className={cn(
                          "w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0",
                          getAvatarColor(user.name),
                          user.streakCount >= 7 ? "streak-glow" : ""
                        )}
                      >
                        {getInitials(user.name)}
                      </div>
                      {user.streakCount >= 7 && (
                        <span className="absolute -bottom-0.5 -right-0.5 text-xs">🔥</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-[#1A1A1A] text-sm truncate">{user.name}</p>
                        {user.badges[0] && <span className="text-xs">{user.badges[0].emoji}</span>}
                      </div>
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: profColor + "20", color: profColor }}
                      >
                        {user.profession}
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-[#737373] mb-2">
                    <MapPin size={11} />
                    <span className="text-xs">{user.neighborhood}, {user.city === "San Francisco" ? "SF" : "Oakland"}</span>
                  </div>

                  {/* Currently into */}
                  <div className="bg-[#F5F0E8] rounded-xl px-2.5 py-2 mb-3">
                    <p className="text-[10px] font-semibold text-[#B0ABA3] uppercase tracking-wide">Currently into</p>
                    <p className="text-xs text-[#3D3D3D] line-clamp-2 mt-0.5">{user.currentlyInto}</p>
                  </div>

                  {/* Interests */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {user.interests.slice(0, 3).map((interest) => (
                      <span key={interest} className="text-[10px] bg-[#F0EDE6] text-[#5A5450] px-2 py-0.5 rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F0EDE6]">
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-[#E8734A]" fill="#E8734A" />
                      <span className="text-xs font-semibold text-[#1A1A1A]">{user.communityScore.total}</span>
                    </div>
                    {user.streakCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Flame size={11} className="text-[#E8734A]" />
                        <span className="text-xs text-[#737373]">{user.streakCount}d</span>
                      </div>
                    )}
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: user.availability === "Open to Meet" ? "#7B9E87" : "#B0ABA3" }}
                    >
                      {user.availability}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
