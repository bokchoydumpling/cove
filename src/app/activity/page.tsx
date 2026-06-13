"use client";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { useAppStore } from "@/store/useAppStore";
import { cn, getInitials, getAvatarColor, formatRelativeTime } from "@/lib/utils";

const ACTIVITY_FEED = [
  { id: "a1", type: "new_neighbor", actorId: "u13", content: "joined your neighborhood and they're into AI and coffee.", time: "2026-06-12T10:00:00Z", icon: "👋" },
  { id: "a2", type: "new_showcase", actorId: "u10", content: "posted a new showcase: Fruitvale Transit Hub Mural", time: "2026-06-12T09:30:00Z", icon: "✨" },
  { id: "a3", type: "currently_into", actorId: "u5", content: "is now into: Closing our seed round — $1.2M and counting", time: "2026-06-12T09:00:00Z", icon: "🔄" },
  { id: "a4", type: "new_event", actorId: "u1", content: "created a new event: SF AI Builders — Demos & Drinks", time: "2026-06-12T08:30:00Z", icon: "🎉" },
  { id: "a5", type: "vouch", actorId: "u3", content: "vouched for Imani Bell as a Community Builder.", time: "2026-06-12T08:00:00Z", icon: "🤝" },
  { id: "a6", type: "streak_milestone", actorId: "u27", content: "hit a 112-day streak. That's wild.", time: "2026-06-11T22:00:00Z", icon: "🔥" },
  { id: "a7", type: "event_rsvp", actorId: "u9", content: "RSVPed to SF AI Builders — Demos & Drinks", time: "2026-06-11T20:00:00Z", icon: "📅" },
  { id: "a8", type: "new_circle", actorId: "u4", content: "founded a new circle: Creative Collabs", time: "2026-06-11T18:00:00Z", icon: "🌱" },
  { id: "a9", type: "new_showcase", actorId: "u23", content: "posted a new showcase: Bay Summer (EP)", time: "2026-06-11T16:00:00Z", icon: "✨" },
  { id: "a10", type: "currently_into", actorId: "u8", content: "is now into: Writing a longform piece on Oakland gentrification", time: "2026-06-11T14:00:00Z", icon: "🔄" },
  { id: "a11", type: "new_neighbor", actorId: "u29", content: "joined your neighborhood and they're into AI and gaming.", time: "2026-06-11T12:00:00Z", icon: "👋" },
  { id: "a12", type: "vouch", actorId: "u30", content: "vouched for Marcus Obi as a Community Builder.", time: "2026-06-11T10:00:00Z", icon: "🤝" },
];

const typeLabel: Record<string, string> = {
  new_neighbor: "New Neighbor",
  new_showcase: "New Showcase",
  currently_into: "Currently Into",
  new_event: "New Event",
  vouch: "Vouch",
  streak_milestone: "Streak",
  event_rsvp: "RSVP",
  new_circle: "New Circle",
};

const typeColor: Record<string, string> = {
  new_neighbor: "bg-[#EBF5EE] text-[#3E8A54]",
  new_showcase: "bg-[#F3EFFC] text-[#6B4EC4]",
  currently_into: "bg-[#EBF0FB] text-[#3B5CC4]",
  new_event: "bg-[#FDF0EB] text-[#B35C2E]",
  vouch: "bg-[#FFF3E0] text-[#C67A1E]",
  streak_milestone: "bg-[#FDF0EB] text-[#E8734A]",
  event_rsvp: "bg-[#F0EDE6] text-[#5A5450]",
  new_circle: "bg-[#EBF5EE] text-[#3E8A54]",
};

export default function ActivityPage() {
  const { users } = useAppStore();
  const getUser = (id: string) => users.find((u) => u.id === id);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Activity</h1>
          <p className="text-[#737373] text-sm mt-1">Your city&apos;s pulse — what&apos;s happening nearby.</p>
        </div>

        {/* Discovery nudges */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: "🤖", text: "3 people near you are into AI this week." },
            { icon: "🌱", text: "A new circle launched in the Mission." },
            { icon: "📍", text: "A new event is happening 2 blocks away." },
          ].map((nudge) => (
            <div key={nudge.icon} className="bg-white rounded-2xl border border-[#E8E4DC] p-3 text-center">
              <div className="text-2xl mb-1">{nudge.icon}</div>
              <p className="text-[11px] text-[#4A4A4A] leading-relaxed">{nudge.text}</p>
            </div>
          ))}
        </div>

        {/* Feed */}
        <div className="space-y-3">
          {ACTIVITY_FEED.map((item) => {
            const user = getUser(item.actorId);
            if (!user) return null;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-[#E8E4DC] p-4 flex gap-3">
                <div className="relative">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0",
                      getAvatarColor(user.name)
                    )}
                  >
                    {getInitials(user.name)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 text-sm">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/profile/${user.id}`} className="text-xs font-semibold text-[#1A1A1A] hover:text-[#E8734A]">
                      {user.name}
                    </Link>
                    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", typeColor[item.type] ?? "bg-[#F0EDE6] text-[#5A5450]")}>
                      {typeLabel[item.type]}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A4A4A] mt-0.5">{item.content}</p>
                  <p className="text-[10px] text-[#B0ABA3] mt-1">{formatRelativeTime(item.time)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
