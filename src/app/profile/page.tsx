"use client";
import { useState } from "react";
import { MapPin, Flame, Edit2, Check, Shield, Eye, EyeOff } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAppStore } from "@/store/useAppStore";
import CommunityScoreCard from "@/components/profile/CommunityScoreCard";
import BadgeList from "@/components/profile/BadgeList";
import ShowcaseCarousel from "@/components/profile/ShowcaseCarousel";
import VouchSection from "@/components/profile/VouchSection";
import { cn, getProfessionColor, formatRelativeTime } from "@/lib/utils";
import CoveAvatar from "@/components/ui/CoveAvatar";
import type { VisibilityState } from "@/lib/types";

const VISIBILITY_OPTIONS: VisibilityState[] = [
  "Visible to Everyone", "Friends Only", "Event Only", "Hidden"
];

export default function ProfilePage() {
  const { currentUser, updateCurrentlyInto } = useAppStore();
  const [editingInto, setEditingInto] = useState(false);
  const [intoText, setIntoText] = useState(currentUser.currentlyInto);
  const [visibility, setVisibility] = useState<VisibilityState>(currentUser.visibilityState);
  const profColor = getProfessionColor(currentUser.profession);

  const saveInto = () => {
    updateCurrentlyInto(intoText);
    setEditingInto(false);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Hero */}
        <div className="bg-white rounded-2xl border border-[#E9E3DB] overflow-hidden mb-5">
          <div className="h-28 bg-gradient-to-r from-[#FEEEEA] via-[#F5EDD8] to-[#EBF5F0]" />
          <div className="px-6 pb-5">
            <div className="flex items-end gap-4 -mt-8 mb-4">
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl border-4 border-white overflow-hidden shadow-md",
                  currentUser.streakCount >= 7 ? "streak-glow" : ""
                )}
              >
                <CoveAvatar src={currentUser.avatar} name={currentUser.name} size={64} />
              </div>
              <div className="mb-1 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-[#2F2A26]">{currentUser.name}</h1>
                  {currentUser.badges.slice(0, 3).map((b) => (
                    <span key={b.type} title={b.label}>{b.emoji}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: profColor + "20", color: profColor }}
                  >
                    {currentUser.profession}
                  </span>
                  <div className="flex items-center gap-1 text-[#6E6A65]">
                    <MapPin size={11} />
                    <span className="text-xs">{currentUser.neighborhood}, {currentUser.city === "San Francisco" ? "SF" : "Oakland"}</span>
                  </div>
                </div>
              </div>
              {currentUser.streakCount >= 7 && (
                <div className="flex items-center gap-1.5 bg-[#FEEEEA] px-3 py-1.5 rounded-xl">
                  <Flame size={14} className="text-[#F47A5C]" />
                  <span className="text-sm font-semibold text-[#F47A5C]">{currentUser.streakCount}</span>
                  <span className="text-xs text-[#B35C2E]">day streak</span>
                </div>
              )}
            </div>
            <p className="text-sm text-[#2F2A26] leading-relaxed mb-3">{currentUser.bio}</p>
            <p className="text-xs text-[#6E6A65] italic">&ldquo;{currentUser.personalityPrompt}&rdquo;</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Left col */}
          <div className="col-span-2 space-y-5">
            {/* Currently Into */}
            <div className="bg-white rounded-2xl border border-[#E9E3DB] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#2F2A26]">Currently Into</h3>
                <button
                  onClick={() => editingInto ? saveInto() : setEditingInto(true)}
                  className="flex items-center gap-1 text-xs text-[#F47A5C] font-medium hover:underline"
                >
                  {editingInto ? <><Check size={13} /> Save</> : <><Edit2 size={13} /> Edit</>}
                </button>
              </div>
              {editingInto ? (
                <textarea
                  value={intoText}
                  onChange={(e) => setIntoText(e.target.value)}
                  className="w-full text-sm text-[#2F2A26] bg-[#F2EDE4] rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#F47A5C]/30"
                  rows={2}
                  maxLength={120}
                />
              ) : (
                <p className="text-sm text-[#2F2A26]">{currentUser.currentlyInto}</p>
              )}
              <p className="text-[10px] text-[#9B9690] mt-2">
                Updated {formatRelativeTime(currentUser.currentlyIntoUpdatedAt)}
              </p>
            </div>

            {/* Interests + Looking For */}
            <div className="bg-white rounded-2xl border border-[#E9E3DB] p-5">
              <h3 className="text-sm font-medium text-[#2F2A26] mb-3">Interests</h3>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {currentUser.interests.map((i) => (
                  <span key={i} className="text-xs bg-[#EDE7DF] text-[#6E6A65] px-2.5 py-1 rounded-full font-medium">{i}</span>
                ))}
              </div>
              <h3 className="text-sm font-medium text-[#2F2A26] mb-3">Looking For</h3>
              <div className="flex flex-wrap gap-1.5">
                {currentUser.lookingFor.map((l) => (
                  <span key={l} className="text-xs bg-[#EBF0FB] text-[#3B5CC4] px-2.5 py-1 rounded-full font-medium">{l}</span>
                ))}
              </div>
            </div>

            {/* Showcase */}
            <div className="bg-white rounded-2xl border border-[#E9E3DB] p-5">
              <ShowcaseCarousel items={currentUser.showcaseItems} userId={currentUser.id} />
            </div>

            {/* Vouches */}
            <VouchSection vouches={currentUser.vouches} />
          </div>

          {/* Right col */}
          <div className="space-y-4">
            {/* Score */}
            <CommunityScoreCard score={currentUser.communityScore} />

            {/* Badges */}
            <BadgeList badges={currentUser.badges} />

            {/* Privacy controls */}
            <div className="bg-white rounded-2xl border border-[#E9E3DB] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-[#6E6A65]" />
                <h3 className="text-xs font-medium text-[#2F2A26]">Visibility</h3>
              </div>
              <div className="space-y-1.5">
                {VISIBILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setVisibility(opt)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all text-left",
                      visibility === opt
                        ? "bg-[#FEEEEA] text-[#F47A5C] font-medium"
                        : "text-[#2F2A26] hover:bg-[#F2EDE4]"
                    )}
                  >
                    {opt === "Hidden" ? <EyeOff size={12} /> : <Eye size={12} />}
                    {opt}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#9B9690] mt-3 leading-relaxed">
                Controls who can discover you on the map and in search.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
