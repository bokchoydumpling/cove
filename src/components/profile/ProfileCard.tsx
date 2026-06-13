"use client";
import Link from "next/link";
import { X, MapPin, Flame, Star, MessageCircle, UserPlus } from "lucide-react";
import type { User } from "@/lib/types";
import { cn, getInitials, getAvatarColor, formatRelativeTime, getProfessionColor } from "@/lib/utils";

interface ProfileCardProps {
  user: User;
  onClose?: () => void;
  compact?: boolean;
}

export default function ProfileCard({ user, onClose, compact = false }: ProfileCardProps) {
  const profColor = getProfessionColor(user.profession);

  return (
    <div className={cn("bg-white rounded-2xl shadow-lg overflow-hidden", compact ? "w-72" : "w-80")}>
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#FDF0EB] to-[#F5F0E8] px-4 pt-4 pb-3">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-[#737373] hover:text-[#1A1A1A] transition-colors"
          >
            <X size={14} />
          </button>
        )}
        <div className="flex items-start gap-3">
          <div className="relative">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0",
                getAvatarColor(user.name),
                user.streakCount >= 7 ? "streak-glow" : ""
              )}
            >
              {getInitials(user.name)}
            </div>
            {user.streakCount >= 7 && (
              <span className="absolute -bottom-1 -right-1 text-xs">🔥</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#1A1A1A] text-sm truncate">{user.name}</h3>
              {user.badges.length > 0 && (
                <span className="text-xs">{user.badges[0].emoji}</span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: profColor + "20", color: profColor }}
              >
                {user.profession}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[#737373]">
              <MapPin size={11} />
              <span className="text-xs">{user.neighborhood}</span>
              <span className="text-xs mx-0.5">·</span>
              <span
                className="text-xs font-medium"
                style={{ color: user.availability === "Open to Meet" ? "#7B9E87" : user.availability === "Open to Chat" ? "#6BAED6" : "#B0ABA3" }}
              >
                {user.availability}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Currently into */}
        <div className="bg-[#F5F0E8] rounded-xl px-3 py-2">
          <p className="text-[10px] font-semibold text-[#B0ABA3] uppercase tracking-wide mb-0.5">Currently into</p>
          <p className="text-xs text-[#3D3D3D] leading-relaxed">{user.currentlyInto}</p>
        </div>

        {/* Personality prompt */}
        <p className="text-xs text-[#737373] italic">&ldquo;{user.personalityPrompt}&rdquo;</p>

        {/* Interest tags */}
        <div className="flex flex-wrap gap-1">
          {user.interests.slice(0, 4).map((interest) => (
            <span
              key={interest}
              className="text-[10px] bg-[#F0EDE6] text-[#5A5450] px-2 py-0.5 rounded-full font-medium"
            >
              {interest}
            </span>
          ))}
        </div>

        {/* Score */}
        <div className="flex items-center justify-between pt-1 border-t border-[#F0EDE6]">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-[#E8734A]" fill="#E8734A" />
            <span className="text-xs font-semibold text-[#1A1A1A]">{user.communityScore.total}</span>
            <span className="text-xs text-[#B0ABA3]">pts</span>
          </div>
          {user.streakCount > 0 && (
            <div className="flex items-center gap-1">
              <Flame size={12} className="text-[#E8734A]" />
              <span className="text-xs text-[#737373]">{user.streakCount}d streak</span>
            </div>
          )}
          <span className="text-xs text-[#B0ABA3]">
            {formatRelativeTime(user.lastActive)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Link
            href={`/messages`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F0EDE6] text-[#3D3D3D] text-xs font-medium hover:bg-[#E8E4DC] transition-colors"
          >
            <MessageCircle size={13} />
            Message
          </Link>
          <Link
            href={`/profile/${user.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#E8734A] text-white text-xs font-medium hover:bg-[#D4623B] transition-colors"
          >
            <UserPlus size={13} />
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
