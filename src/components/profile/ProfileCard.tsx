"use client";
import Link from "next/link";
import { X, MapPin, MessageCircle, ExternalLink } from "lucide-react";
import type { User } from "@/lib/types";
import { cn, getProfessionColor, formatRelativeTime } from "@/lib/utils";
import CoveAvatar from "@/components/ui/CoveAvatar";

interface ProfileCardProps {
  user: User;
  onClose?: () => void;
  compact?: boolean;
}

const AVAILABILITY_CONFIG: Record<string, { color: string; bg: string; emoji: string }> = {
  "Open to Meet":    { color: "#1A7A5A", bg: "#D1FAE5", emoji: "🟢" },
  "Open to Chat":    { color: "#1D5FAA", bg: "#DBEAFE", emoji: "💬" },
  "Attending Events":{ color: "#6B21A8", bg: "#F3E8FF", emoji: "🎉" },
  "Exploring":       { color: "#92400E", bg: "#FEF3C7", emoji: "🔍" },
  "Just Browsing":   { color: "#374151", bg: "#F3F4F6", emoji: "👀" },
};

export default function ProfileCard({ user, onClose, compact = false }: ProfileCardProps) {
  const profColor = getProfessionColor(user.profession);
  const avail = AVAILABILITY_CONFIG[user.availability] ?? AVAILABILITY_CONFIG["Just Browsing"];

  return (
    <div className={cn(
      "bg-white rounded-3xl shadow-2xl overflow-hidden border border-black/5",
      compact ? "w-72" : "w-80"
    )}>
      {/* Warm gradient header */}
      <div
        className="relative px-5 pt-5 pb-4"
        style={{ background: "linear-gradient(135deg, #FFF1EC 0%, #FDF8F0 50%, #EEF8F4 100%)" }}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/8 flex items-center justify-center text-[#737373] hover:text-[#1A1A1A] hover:bg-black/12 transition-all"
          >
            <X size={14} />
          </button>
        )}

        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div style={{
              width: 56, height: 56,
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid white",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            }}>
              <CoveAvatar src={user.avatar} name={user.name} size={56} />
            </div>
            {user.streakCount >= 7 && (
              <span className="absolute -bottom-1 -right-1 text-sm leading-none">🔥</span>
            )}
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-[#18181B] text-base leading-tight truncate">{user.name}</h3>
              {user.badges.length > 0 && (
                <span className="text-sm leading-none">{user.badges[0].emoji}</span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: profColor + "1A", color: profColor }}
              >
                {user.profession}
              </span>
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: avail.bg, color: avail.color }}
              >
                {avail.emoji} {user.availability}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-[#71717A]">
              <MapPin size={11} />
              <span className="text-[11px]">{user.neighborhood}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {/* Currently into */}
        <div
          className="rounded-2xl px-3.5 py-2.5"
          style={{ background: "linear-gradient(135deg, #FFF7ED, #FDF8F0)" }}
        >
          <p className="text-[10px] font-bold text-[#E8734A] uppercase tracking-widest mb-1">✨ Currently into</p>
          <p className="text-xs text-[#3D3D3D] leading-relaxed">{user.currentlyInto}</p>
        </div>

        {/* Personality */}
        <p className="text-xs text-[#71717A] italic leading-relaxed">&ldquo;{user.personalityPrompt}&rdquo;</p>

        {/* Interest tags */}
        <div className="flex flex-wrap gap-1.5">
          {user.interests.slice(0, 5).map((interest, i) => (
            <span
              key={interest}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full"
              style={{
                background: ["#FFF1EC", "#EEF8F4", "#F0EEFF", "#EEF6FF", "#FFF8EC"][i % 5],
                color: ["#C4572A", "#2A7A5A", "#6B4EC4", "#2A5FAA", "#AA6B00"][i % 5],
              }}
            >
              {interest}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 py-2 border-t border-[#F4F4F5]">
          <div className="flex items-center gap-1.5">
            <span className="text-base">⭐</span>
            <div>
              <p className="text-sm font-bold text-[#18181B] leading-none">{user.communityScore.total}</p>
              <p className="text-[10px] text-[#A1A1AA]">points</p>
            </div>
          </div>
          {user.streakCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-base">🔥</span>
              <div>
                <p className="text-sm font-bold text-[#18181B] leading-none">{user.streakCount}d</p>
                <p className="text-[10px] text-[#A1A1AA]">streak</p>
              </div>
            </div>
          )}
          <div className="ml-auto text-[11px] text-[#A1A1AA]">
            {formatRelativeTime(user.lastActive)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-0.5">
          <Link
            href="/messages"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-semibold transition-all bg-[#F4F4F5] text-[#3D3D3D] hover:bg-[#E4E4E7]"
          >
            <MessageCircle size={13} />
            Message
          </Link>
          <Link
            href={`/profile/${user.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-semibold transition-all text-white"
            style={{ background: "linear-gradient(135deg, #E8734A, #F4A574)" }}
          >
            <ExternalLink size={13} />
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
