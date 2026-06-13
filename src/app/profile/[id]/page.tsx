"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Flame, MessageCircle, UserPlus, Star, Check } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAppStore } from "@/store/useAppStore";
import CommunityScoreCard from "@/components/profile/CommunityScoreCard";
import BadgeList from "@/components/profile/BadgeList";
import ShowcaseCarousel from "@/components/profile/ShowcaseCarousel";
import VouchSection from "@/components/profile/VouchSection";
import { cn, getInitials, getAvatarColor, getProfessionColor, formatRelativeTime } from "@/lib/utils";

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { users, circles, events } = useAppStore();
  const [following, setFollowing] = useState(false);
  const user = users.find((u) => u.id === id);

  if (!user) return (
    <AppShell>
      <div className="flex items-center justify-center h-64">
        <p className="text-[#737373]">User not found.</p>
      </div>
    </AppShell>
  );

  const profColor = getProfessionColor(user.profession);
  const userCircles = circles.filter((c) => user.circleIds.includes(c.id));
  const userEvents = events.filter((e) => user.eventIds.includes(e.id)).slice(0, 3);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-6">
        <Link href="/people" className="flex items-center gap-1.5 text-sm text-[#737373] hover:text-[#E8734A] mb-4">
          <ArrowLeft size={15} /> People
        </Link>

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden mb-5">
          <div className="h-24 bg-gradient-to-r from-[#FDF0EB] via-[#F5EDD8] to-[#EBF5F0]" />
          <div className="px-6 pb-5">
            <div className="flex items-end gap-4 -mt-7 mb-4">
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl border-4 border-white flex items-center justify-center text-white text-lg font-bold shadow-md",
                  getAvatarColor(user.name),
                  user.streakCount >= 7 ? "streak-glow" : ""
                )}
              >
                {getInitials(user.name)}
              </div>
              <div className="flex-1 mb-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[#1A1A1A]">{user.name}</h1>
                  {user.badges.slice(0, 2).map((b) => (
                    <span key={b.type} title={b.label}>{b.emoji}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: profColor + "20", color: profColor }}
                  >
                    {user.profession}
                  </span>
                  <div className="flex items-center gap-1 text-[#737373]">
                    <MapPin size={11} />
                    <span className="text-xs">{user.neighborhood}, {user.city === "San Francisco" ? "SF" : "Oakland"}</span>
                  </div>
                  {user.streakCount >= 7 && (
                    <div className="flex items-center gap-1">
                      <Flame size={11} className="text-[#E8734A]" />
                      <span className="text-xs text-[#E8734A] font-medium">{user.streakCount}d streak</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mb-0.5">
                <Link
                  href="/messages"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F0EDE6] text-[#3D3D3D] text-xs font-medium hover:bg-[#E8E4DC] transition-colors"
                >
                  <MessageCircle size={13} /> Message
                </Link>
                <button
                  onClick={() => setFollowing(!following)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                    following
                      ? "bg-[#EBF5EE] text-[#3E8A54]"
                      : "bg-[#E8734A] text-white hover:bg-[#D4623B]"
                  )}
                >
                  {following ? <><Check size={13} /> Following</> : <><UserPlus size={13} /> Follow</>}
                </button>
              </div>
            </div>

            <p className="text-sm text-[#4A4A4A] leading-relaxed mb-2">{user.bio}</p>
            <p className="text-xs text-[#737373] italic mb-3">&ldquo;{user.personalityPrompt}&rdquo;</p>

            {/* Score summary */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Star size={14} className="text-[#E8734A]" fill="#E8734A" />
                <span className="text-sm font-bold text-[#1A1A1A]">{user.communityScore.total}</span>
                <span className="text-xs text-[#737373]">points</span>
              </div>
              <span className="text-[#E8E4DC]">·</span>
              <span className="text-xs text-[#737373]">Active {formatRelativeTime(user.lastActive)}</span>
              <span className="text-[#E8E4DC]">·</span>
              <span
                className="text-xs font-medium"
                style={{ color: user.availability === "Open to Meet" ? "#7B9E87" : "#B0ABA3" }}
              >
                {user.availability}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-5">
            {/* Currently into */}
            <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
              <h3 className="text-xs font-semibold text-[#B0ABA3] uppercase tracking-wide mb-2">Currently Into</h3>
              <p className="text-sm text-[#3D3D3D]">{user.currentlyInto}</p>
              <p className="text-[10px] text-[#B0ABA3] mt-2">
                Updated {formatRelativeTime(user.currentlyIntoUpdatedAt)}
              </p>
            </div>

            {/* Interests */}
            <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Interests</h3>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {user.interests.map((i) => (
                  <span key={i} className="text-xs bg-[#F0EDE6] text-[#5A5450] px-2.5 py-1 rounded-full font-medium">{i}</span>
                ))}
              </div>
              {user.lookingFor.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Looking For</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {user.lookingFor.map((l) => (
                      <span key={l} className="text-xs bg-[#EBF0FB] text-[#3B5CC4] px-2.5 py-1 rounded-full font-medium">{l}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Showcase */}
            {user.showcaseItems.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
                <ShowcaseCarousel items={user.showcaseItems} userId={user.id} />
              </div>
            )}

            {/* Circles */}
            {userCircles.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Circles</h3>
                <div className="space-y-2">
                  {userCircles.map((c) => (
                    <Link key={c.id} href={`/circles/${c.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F5F0E8] transition-colors">
                      <span className="text-lg">{c.emoji}</span>
                      <div>
                        <p className="text-xs font-semibold text-[#1A1A1A]">{c.name}</p>
                        <p className="text-[10px] text-[#B0ABA3]">{c.memberCount} members</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Vouches */}
            <VouchSection vouches={user.vouches} />
          </div>

          <div className="space-y-4">
            <CommunityScoreCard score={user.communityScore} />
            <BadgeList badges={user.badges} />

            {/* Upcoming events */}
            {userEvents.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8E4DC] p-4">
                <h3 className="text-xs font-semibold text-[#1A1A1A] mb-3">Events</h3>
                <div className="space-y-2.5">
                  {userEvents.map((e) => (
                    <Link key={e.id} href={`/events/${e.id}`} className="block hover:opacity-80">
                      <p className="text-xs font-medium text-[#1A1A1A] line-clamp-1">{e.title}</p>
                      <p className="text-[10px] text-[#B0ABA3]">{e.neighborhood}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
