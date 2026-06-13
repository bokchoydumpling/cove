"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAppStore } from "@/store/useAppStore";
import { cn, getInitials, getAvatarColor, formatShortDate } from "@/lib/utils";
import type { ShowcaseReaction } from "@/lib/types";

const REACTIONS: { key: ShowcaseReaction; emoji: string; label: string }[] = [
  { key: "collab", emoji: "🔥", label: "Want to Collab" },
  { key: "inspired", emoji: "👏", label: "Inspired" },
  { key: "feedback", emoji: "💡", label: "Have Feedback" },
];

export default function ShowcasePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { users } = useAppStore();
  const user = users.find((u) => u.id === userId);
  const [reacted, setReacted] = useState<Record<string, Set<ShowcaseReaction>>>({});
  const [counts, setCounts] = useState<Record<string, Record<ShowcaseReaction, number>>>(() => {
    const init: Record<string, Record<ShowcaseReaction, number>> = {};
    user?.showcaseItems.forEach((item) => {
      init[item.id] = { ...item.reactions };
    });
    return init;
  });

  if (!user) return (
    <AppShell>
      <div className="flex items-center justify-center h-64">
        <p className="text-[#737373]">User not found.</p>
      </div>
    </AppShell>
  );

  const toggleReaction = (itemId: string, reaction: ShowcaseReaction) => {
    const itemReacted = reacted[itemId] ?? new Set();
    const hasReacted = itemReacted.has(reaction);
    const newSet = new Set(itemReacted);
    if (hasReacted) { newSet.delete(reaction); }
    else { newSet.add(reaction); }
    setReacted((r) => ({ ...r, [itemId]: newSet }));
    setCounts((c) => ({
      ...c,
      [itemId]: {
        ...c[itemId],
        [reaction]: (c[itemId]?.[reaction] ?? 0) + (hasReacted ? -1 : 1),
      },
    }));
  };

  const categories = [...new Set(user.showcaseItems.map((i) => i.category))];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Back */}
        <Link href={`/profile/${user.id}`} className="flex items-center gap-1.5 text-sm text-[#737373] hover:text-[#E8734A] mb-4">
          <ArrowLeft size={15} /> {user.name}
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold",
              getAvatarColor(user.name)
            )}
          >
            {getInitials(user.name)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">{user.name}&apos;s Showcase</h1>
            <p className="text-sm text-[#737373]">{user.showcaseItems.length} projects & creations</p>
          </div>
        </div>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-5">
            {categories.map((cat) => (
              <span key={cat} className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F0EDE6] text-[#5A5450]">
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Grid */}
        {user.showcaseItems.length === 0 ? (
          <div className="text-center py-16 bg-[#F5F0E8] rounded-2xl">
            <p className="text-[#737373]">Nothing here yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {user.showcaseItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden hover-lift">
                <div
                  className="w-full h-44 bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.coverImage})` }}
                />
                <div className="p-4">
                  <span className="text-[10px] font-semibold text-[#9B8EC4] uppercase tracking-wider">{item.category}</span>
                  <h3 className="text-sm font-bold text-[#1A1A1A] mt-1">{item.title}</h3>
                  <p className="text-xs text-[#4A4A4A] mt-1.5 line-clamp-3 leading-relaxed">{item.description}</p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-[#E8734A] font-medium hover:underline"
                    >
                      View project →
                    </a>
                  )}
                  <p className="text-[10px] text-[#B0ABA3] mt-2">{formatShortDate(item.createdAt)}</p>

                  {/* Reactions */}
                  <div className="flex gap-1.5 mt-3 pt-3 border-t border-[#F0EDE6] flex-wrap">
                    {REACTIONS.map(({ key, emoji, label }) => {
                      const hasReacted = reacted[item.id]?.has(key) ?? false;
                      const count = counts[item.id]?.[key] ?? 0;
                      return (
                        <button
                          key={key}
                          onClick={() => toggleReaction(item.id, key)}
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border transition-all",
                            hasReacted
                              ? "bg-[#FDF0EB] border-[#E8734A] text-[#E8734A]"
                              : "bg-[#F5F0E8] border-transparent text-[#5A5450] hover:border-[#E8E4DC]"
                          )}
                        >
                          {emoji} {label} · {count}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
