"use client";
import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Search } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAppStore } from "@/store/useAppStore";
import { cn, formatEventDate } from "@/lib/utils";
import CoveAvatar from "@/components/ui/CoveAvatar";
import type { EventCategory } from "@/lib/types";

const CATS: EventCategory[] = ["Coffee Chat","Meetup","Workshop","Volunteer","Hike","Coworking","Happy Hour","Dinner","Talk","Social"];
const CITIES = ["All Cities", "San Francisco", "Oakland"];

export default function EventsPage() {
  const { events } = useAppStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<EventCategory | null>(null);
  const [city, setCity] = useState("All Cities");

  const filtered = events.filter((e) => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) &&
        !e.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && e.category !== category) return false;
    if (city !== "All Cities" && e.city !== city) return false;
    return true;
  });

  const featured = filtered.filter((e) => e.isFeatured);
  const regular = filtered.filter((e) => !e.isFeatured);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#2F2A26]">Events 🎉</h1>
          <p className="text-[#6E6A65] text-sm mt-1">{events.length} events happening near you</p>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9690]" />
          <input
            type="text"
            placeholder="Search events…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#E9E3DB] rounded-2xl text-sm placeholder-[#9B9690] focus:outline-none focus:ring-2 focus:ring-[#F47A5C]/25 focus:border-[#F47A5C] transition-all"
          />
        </div>

        {/* City filter */}
        <div className="flex gap-2 mb-3">
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                city === c
                  ? "bg-[#2F2A26] text-white border-[#2F2A26]"
                  : "bg-white text-[#6E6A65] border-[#E9E3DB] hover:border-[#2F2A26]"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5">
          {CATS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? null : cat)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                category === cat
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white text-[#6E6A65] border-[#E9E3DB] hover:border-[#F47A5C] hover:text-[#F47A5C]"
              )}
              style={category === cat ? { background: "linear-gradient(135deg, #F47A5C, #F4A574)" } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-[#2F2A26] mb-3">✨ Featured</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {featured.map((event) => <EventCard key={event.id} event={event} featured />)}
            </div>
          </div>
        )}

        {/* All events */}
        <div>
          {featured.length > 0 && <h2 className="text-sm font-medium text-[#2F2A26] mb-3">All Events</h2>}
          <div className="grid sm:grid-cols-2 gap-4">
            {regular.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#6E6A65] text-sm">No events match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

import type { Event } from "@/lib/types";
function EventCard({ event, featured = false }: { event: Event; featured?: boolean }) {
  const catColors: Record<string, string> = {
    "Coffee Chat": "bg-[#FFF3E0] text-[#C67A1E]",
    "Meetup": "bg-[#EBF0FB] text-[#3B5CC4]",
    "Workshop": "bg-[#F3EFFC] text-[#6B4EC4]",
    "Volunteer": "bg-[#EBF5EE] text-[#3E8A54]",
    "Hike": "bg-[#E8F4F2] text-[#2E7A72]",
    "Dinner": "bg-[#FEEEEA] text-[#B35C2E]",
    "Social": "bg-[#FDE8F0] text-[#B33B6B]",
  };

  return (
    <Link href={`/events/${event.id}`}>
      <div className={cn("bg-white rounded-3xl border overflow-hidden hover-lift cursor-pointer", featured ? "border-[#F47A5C]/40" : "border-[#EDE7DF]")}>
        <div className="relative h-32 bg-cover bg-center" style={{ backgroundImage: `url(${event.coverImage})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {featured && (
            <div className="absolute top-2 left-2 bg-[#F47A5C] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              Featured
            </div>
          )}
          <span className={cn("absolute bottom-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full", catColors[event.category] ?? "bg-white/80 text-[#2F2A26]")}>
            {event.category}
          </span>
        </div>
        <div className="p-3">
          <h3 className="font-medium text-[#2F2A26] text-sm line-clamp-1">{event.title}</h3>
          <div className="flex items-center gap-1 mt-1.5 text-[#6E6A65]">
            <Calendar size={12} />
            <span className="text-xs">{formatEventDate(event.date, event.time)}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[#6E6A65]">
            <MapPin size={12} />
            <span className="text-xs">{event.neighborhood}, {event.city === "San Francisco" ? "SF" : "Oakland"}</span>
          </div>
          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#EDE7DF]">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                {event.attendees.slice(0, 3).map((a) => (
                  <div
                    key={a.userId}
                    title={a.name}
                    style={{ width: 20, height: 20, borderRadius: "50%", overflow: "hidden", border: "1.5px solid white", flexShrink: 0 }}
                  >
                    <CoveAvatar src={a.avatar} name={a.name} size={20} />
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-[#6E6A65]">
                {event.attendees.length} going
                {event.maxAttendees ? ` · ${event.maxAttendees - event.attendees.length} spots left` : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
