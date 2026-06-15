"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, MapPin } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAppStore } from "@/store/useAppStore";
import { cn, getProfessionColor } from "@/lib/utils";
import CoveAvatar from "@/components/ui/CoveAvatar";
import type { Profession, Interest } from "@/lib/types";

const PROF_FILTERS: Profession[] = [
  "Software Engineer","Designer","Founder","Artist","Musician",
  "Photographer","Marketer","Nonprofit","Writer","Fitness","Student","Food Creator",
];
const INTEREST_FILTERS: Interest[] = [
  "AI","Startups","Coffee","Art","Music","Food","Fitness","Photography","Books","Local Events",
];

const AVAIL_STYLE: Record<string, { color: string; bg: string }> = {
  "Open to Meet":    { color: "#1A7A5A", bg: "#D1FAE5" },
  "Open to Chat":    { color: "#1D5FAA", bg: "#DBEAFE" },
  "Attending Events":{ color: "#6B21A8", bg: "#F3E8FF" },
  "Exploring":       { color: "#92400E", bg: "#FEF3C7" },
  "Just Browsing":   { color: "#2F2A26", bg: "#F3F4F6" },
};

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
          <h1 className="text-2xl font-semibold text-[#2F2A26]">People 👥</h1>
          <p className="text-[#6E6A65] text-sm mt-1">
            {users.length} interesting people across San Francisco & Oakland
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9690]" />
          <input
            type="text"
            placeholder="Search by name, bio, or what they're into…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#E9E3DB] rounded-2xl text-sm text-[#2F2A26] placeholder-[#9B9690] focus:outline-none focus:ring-2 focus:ring-[#F47A5C]/25 focus:border-[#F47A5C] transition-all"
          />
        </div>

        {/* Profession filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
          {PROF_FILTERS.map((p) => (
            <button
              key={p}
              onClick={() => setActiveProfession(activeProfession === p ? null : p)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                activeProfession === p
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white text-[#6E6A65] border-[#E9E3DB] hover:border-[#F47A5C] hover:text-[#F47A5C]"
              )}
              style={activeProfession === p ? { background: "linear-gradient(135deg, #F47A5C, #F4A574)", border: "none" } : {}}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Interest filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {INTEREST_FILTERS.map((i) => (
            <button
              key={i}
              onClick={() => setActiveInterest(activeInterest === i ? null : i)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                activeInterest === i
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white text-[#6E6A65] border-[#E9E3DB] hover:border-[#8BB8A8] hover:text-[#8BB8A8]"
              )}
              style={activeInterest === i ? { background: "linear-gradient(135deg, #8BB8A8, #43D09F)", border: "none" } : {}}
            >
              {i}
            </button>
          ))}
        </div>

        <p className="text-xs text-[#9B9690] mb-4 font-medium">{filtered.length} people</p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((user) => {
            const profColor = getProfessionColor(user.profession);
            const avail = AVAIL_STYLE[user.availability] ?? AVAIL_STYLE["Just Browsing"];
            return (
              <Link key={user.id} href={`/profile/${user.id}`}>
                <div className="bg-white rounded-3xl border border-[#EDE7DF] p-4 hover-lift cursor-pointer group">
                  {/* Avatar + name */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative shrink-0">
                      <div style={{
                        width: 48, height: 48,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "2.5px solid white",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                      }}>
                        <CoveAvatar src={user.avatar} name={user.name} size={48} />
                      </div>
                      {user.streakCount >= 7 && (
                        <span className="absolute -bottom-0.5 -right-0.5 text-xs leading-none">🔥</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-[#2F2A26] text-sm truncate">{user.name}</p>
                        {user.badges[0] && <span className="text-xs">{user.badges[0].emoji}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: profColor + "1A", color: profColor }}
                        >
                          {user.profession}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-[#6E6A65] mb-2.5">
                    <MapPin size={11} />
                    <span className="text-xs">{user.neighborhood}, {user.city === "San Francisco" ? "SF" : "Oakland"}</span>
                  </div>

                  {/* Currently into */}
                  <div
                    className="rounded-2xl px-3 py-2 mb-3"
                    style={{ background: "linear-gradient(135deg, #FFF7ED, #FDF8F0)" }}
                  >
                    <p className="text-[9px] font-semibold text-[#F47A5C] uppercase tracking-widest">✨ Currently into</p>
                    <p className="text-xs text-[#2F2A26] line-clamp-2 mt-0.5">{user.currentlyInto}</p>
                  </div>

                  {/* Interests */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {user.interests.slice(0, 3).map((interest, idx) => (
                      <span
                        key={interest}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: ["#FFF0EE", "#EEF8F4", "#F0EEFF"][idx % 3],
                          color: ["#D05A3D", "#2A7A5A", "#6B4EC4"][idx % 3],
                        }}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-[#E9E3DB]">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">⭐</span>
                      <span className="text-xs font-semibold text-[#2F2A26]">{user.communityScore.total}</span>
                    </div>
                    {user.streakCount > 0 && (
                      <div className="flex items-center gap-0.5">
                        <span className="text-sm">🔥</span>
                        <span className="text-xs text-[#6E6A65]">{user.streakCount}d</span>
                      </div>
                    )}
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: avail.bg, color: avail.color }}
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
