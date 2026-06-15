"use client";
import Link from "next/link";
import { X, MapPin, MessageCircle, ExternalLink } from "lucide-react";
import type { User } from "@/lib/types";
import { cn, getProfessionColor, formatRelativeTime, getInterestColors } from "@/lib/utils";
import CoveAvatar from "@/components/ui/CoveAvatar";

interface ProfileCardProps {
  user: User;
  onClose?: () => void;
  compact?: boolean;
}

const AVAILABILITY_CONFIG: Record<string, { color: string; bg: string; emoji: string }> = {
  "Open to Meet":     { color: "#1A7A5A", bg: "#D1FAE5", emoji: "🟢" },
  "Open to Chat":     { color: "#1D5FAA", bg: "#DBEAFE", emoji: "💬" },
  "Attending Events": { color: "#6B21A8", bg: "#F3E8FF", emoji: "🎉" },
  "Exploring":        { color: "#92400E", bg: "#FEF3C7", emoji: "🔍" },
  "Just Browsing":    { color: "#2F2A26", bg: "#F3F4F6", emoji: "👀" },
};

export default function ProfileCard({ user, onClose, compact = false }: ProfileCardProps) {
  const profColor = getProfessionColor(user.profession);
  const avail = AVAILABILITY_CONFIG[user.availability] ?? AVAILABILITY_CONFIG["Just Browsing"];
  const heroItem = user.showcaseItems?.[0];

  return (
    <div className={cn(
      "bg-[#FFFDFC] rounded-3xl shadow-2xl overflow-hidden border border-black/5",
      compact ? "w-72" : "w-80"
    )}
    style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.08)" }}
    >
      {/* ── Hero — showcase cover or gradient ─────────────────────────── */}
      <div className="relative h-32 overflow-hidden">
        {heroItem ? (
          <>
            <img
              src={heroItem.coverImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/55" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${profColor}30 0%, ${profColor}14 55%, #F2EDE4 100%)`,
            }}
          />
        )}

        {/* Availability pill — top left */}
        <div className="absolute top-3 left-3">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: avail.bg + "D8", color: avail.color }}
          >
            {avail.emoji} {user.availability}
          </span>
        </div>

        {/* Close — top right */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center text-white/90 hover:bg-black/40 transition-all"
          >
            <X size={13} />
          </button>
        )}

        {/* Avatar half-overlapping the bottom edge */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
          <div
            className="w-[60px] h-[60px] rounded-full overflow-hidden border-[3px] border-[#FFFDFC] avatar-bounce"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.20)" }}
          >
            <CoveAvatar src={user.avatar} name={user.name} size={60} />
          </div>
          {user.streakCount >= 7 && (
            <span className="absolute -bottom-0.5 -right-0.5 text-sm leading-none select-none">🔥</span>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="px-4 pb-4">
        {/* Name + badges (centered, padded below avatar) */}
        <div className="pt-10 text-center">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <h3 className="font-semibold text-[#2F2A26] text-base leading-tight">{user.name}</h3>
            {user.badges.slice(0, 2).map((b) => (
              <span key={b.type} title={b.label} className="text-sm leading-none select-none">{b.emoji}</span>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: profColor + "1C", color: profColor }}
            >
              {user.profession}
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 mt-1 text-[#9B9690]">
            <MapPin size={10} />
            <span className="text-[11px]">{user.neighborhood}</span>
          </div>
        </div>

        {/* Currently Into — hero text block */}
        <div
          className="mt-3 rounded-2xl px-3.5 py-2.5"
          style={{ background: "linear-gradient(135deg, #FEEEEA 0%, #FFF9F6 100%)" }}
        >
          <p className="text-[10px] font-semibold text-[#F47A5C] uppercase tracking-widest mb-1">✨ Currently into</p>
          <p className="text-xs text-[#2F2A26] leading-relaxed line-clamp-2">{user.currentlyInto}</p>
        </div>

        {/* Interest tags — community identity colors */}
        <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
          {user.interests.slice(0, 4).map((interest) => (
            <span
              key={interest}
              className="interest-tag text-[11px] font-medium px-2.5 py-1 rounded-full"
              style={getInterestColors(interest)}
            >
              {interest}
            </span>
          ))}
        </div>

        {/* Showcase mini strip — if present */}
        {user.showcaseItems.length > 0 && (
          <div className="mt-3 flex gap-2">
            {user.showcaseItems.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="flex-1 rounded-xl overflow-hidden showcase-zoom-wrap"
                style={{ height: 56 }}
              >
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="showcase-zoom-img w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-[#E9E3DB]">
          <div className="flex items-center gap-1">
            <span className="text-sm leading-none">⭐</span>
            <span className="text-xs font-semibold text-[#2F2A26]">{user.communityScore.total}</span>
            <span className="text-[10px] text-[#9B9690]">pts</span>
          </div>
          {user.streakCount > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-sm leading-none">🔥</span>
              <span className="text-xs font-semibold text-[#2F2A26]">{user.streakCount}d</span>
            </div>
          )}
          <span className="text-[10px] text-[#9B9690] ml-auto">{formatRelativeTime(user.lastActive)}</span>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2 mt-2.5">
          <Link
            href="/messages"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-medium transition-all bg-[#EDE7DF] text-[#2F2A26] hover:bg-[#E9E3DB]"
          >
            <MessageCircle size={13} />
            Message
          </Link>
          <Link
            href={`/profile/${user.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #F47A5C, #F4A574)" }}
          >
            <ExternalLink size={13} />
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
