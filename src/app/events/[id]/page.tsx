"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Users, ExternalLink } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAppStore } from "@/store/useAppStore";
import { cn, formatFullDate } from "@/lib/utils";
import CoveAvatar from "@/components/ui/CoveAvatar";

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { events, users } = useAppStore();
  const [rsvpd, setRsvpd] = useState(false);
  const event = events.find((e) => e.id === id);

  if (!event) return (
    <AppShell>
      <div className="flex items-center justify-center h-64">
        <p className="text-[#6E6A65]">Event not found.</p>
      </div>
    </AppShell>
  );

  const host = users.find((u) => u.id === event.hostId);
  const spotsLeft = event.maxAttendees ? event.maxAttendees - event.attendees.length : null;

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
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-6">
        <Link href="/events" className="flex items-center gap-1.5 text-sm text-[#6E6A65] hover:text-[#F47A5C] mb-4">
          <ArrowLeft size={15} /> Events
        </Link>

        {/* Cover */}
        <div
          className="w-full h-48 rounded-2xl bg-cover bg-center relative overflow-hidden mb-5"
          style={{ backgroundImage: `url(${event.coverImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className={cn("absolute bottom-4 left-4 text-xs font-medium px-2.5 py-1 rounded-full", catColors[event.category] ?? "bg-white/80 text-[#2F2A26]")}>
            {event.category}
          </span>
          {event.isFeatured && (
            <span className="absolute top-4 right-4 bg-[#F47A5C] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
        </div>

        <div className="flex gap-5">
          {/* Main */}
          <div className="flex-1 space-y-5">
            <div>
              <h1 className="text-xl font-semibold text-[#2F2A26]">{event.title}</h1>
              <div className="flex flex-wrap gap-1 mt-2">
                {event.tags.map((tag) => (
                  <span key={tag} className="text-[10px] bg-[#EDE7DF] text-[#6E6A65] px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>

            {/* Event details */}
            <div className="bg-white rounded-2xl border border-[#E9E3DB] p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FEEEEA] rounded-xl flex items-center justify-center">
                  <Calendar size={15} className="text-[#F47A5C]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#2F2A26]">{formatFullDate(event.date)}</p>
                  <p className="text-xs text-[#6E6A65]">{event.time}{event.endTime ? ` – ${event.endTime}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#EBF5EE] rounded-xl flex items-center justify-center">
                  <MapPin size={15} className="text-[#8BB8A8]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#2F2A26]">{event.neighborhood}, {event.city}</p>
                  <p className="text-xs text-[#6E6A65]">{event.address}</p>
                </div>
              </div>
              {spotsLeft !== null && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#F3EFFC] rounded-xl flex items-center justify-center">
                    <Users size={15} className="text-[#9B8EC4]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#2F2A26]">{event.attendees.length} attending</p>
                    <p className="text-xs text-[#6E6A65]">{spotsLeft} spots remaining</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-[#E9E3DB] p-4">
              <h3 className="text-sm font-medium text-[#2F2A26] mb-2">About this event</h3>
              <p className="text-sm text-[#2F2A26] leading-relaxed">{event.description}</p>
            </div>

            {/* Host */}
            {host && (
              <div className="bg-white rounded-2xl border border-[#E9E3DB] p-4">
                <h3 className="text-xs font-medium text-[#9B9690] uppercase tracking-wide mb-3">Hosted by</h3>
                <Link href={`/profile/${host.id}`} className="flex items-center gap-3 hover:opacity-80">
                  <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                    <CoveAvatar src={host.avatar} name={host.name} size={40} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2F2A26]">{host.name}</p>
                    <p className="text-xs text-[#6E6A65]">{host.profession} · {host.neighborhood}</p>
                  </div>
                  <ExternalLink size={13} className="ml-auto text-[#9B9690]" />
                </Link>
              </div>
            )}

            {/* RSVP button */}
            <button
              onClick={() => setRsvpd(!rsvpd)}
              className={cn(
                "w-full py-3 rounded-xl font-medium text-sm transition-all",
                rsvpd
                  ? "bg-[#EBF5EE] text-[#3E8A54] border-2 border-[#8BB8A8]"
                  : "bg-[#F47A5C] text-white hover:bg-[#E0674A]"
              )}
            >
              {rsvpd ? "✓ You're going!" : "RSVP — I'm in"}
            </button>
          </div>

          {/* Attendees sidebar */}
          <div className="w-52 shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E9E3DB] p-4">
              <h3 className="text-xs font-medium text-[#2F2A26] mb-3">
                Going ({event.attendees.length})
              </h3>
              <div className="space-y-2.5">
                {event.attendees.map((a) => (
                  <div key={a.userId} className="flex items-center gap-2">
                    <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                      <CoveAvatar src={a.avatar} name={a.name} size={28} />
                    </div>
                    <span className="text-xs text-[#2F2A26] truncate">{a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
