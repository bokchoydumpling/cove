"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAppStore } from "@/store/useAppStore";
import { cn, formatShortDate } from "@/lib/utils";
import CoveAvatar from "@/components/ui/CoveAvatar";
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
        <p className="text-[#6E6A65]">User not found.</p>
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
        <Link href={`/profile/${user.id}`} className="flex items-center gap-1.5 text-sm text-[#6E6A65] hover:text-[#F47A5C] mb-4">
          <ArrowLeft size={15} /> {user.name}
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden" }}>
            <CoveAvatar src={user.avatar} name={user.name} size={48} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#2F2A26]">{user.name}&apos;s Showcase</h1>
            <p className="text-sm text-[#6E6A65]">{user.showcaseItems.length} projects & creations</p>
          </div>
        </div>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-5">
            {categories.map((cat) => (
              <span key={cat} className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-[#EDE7DF] text-[#6E6A65]">
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Grid */}
        {user.showcaseItems.length === 0 ? (
          <div className="text-center py-16 bg-[#F2EDE4] rounded-2xl">
            <p className="text-[#6E6A65]">Nothing here yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {user.showcaseItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-[#E9E3DB] overflow-hidden hover-lift">
                <div
                  className="w-full h-44 bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.coverImage})` }}
                />
                <div className="p-4">
                  <span className="text-[10px] font-medium text-[#9B8EC4] uppercase tracking-wider">{item.category}</span>
                  <h3 className="text-sm font-semibold text-[#2F2A26] mt-1">{item.title}</h3>
                  <p className="text-xs text-[#2F2A26] mt-1.5 line-clamp-3 leading-relaxed">{item.description}</p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-[#F47A5C] font-medium hover:underline"
                    >
                      View project →
                    </a>
                  )}
                  <p className="text-[10px] text-[#9B9690] mt-2">{formatShortDate(item.createdAt)}</p>

                  {/* Reactions */}
                  <div className="flex gap-1.5 mt-3 pt-3 border-t border-[#EDE7DF] flex-wrap">
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
                              ? "bg-[#FEEEEA] border-[#F47A5C] text-[#F47A5C]"
                              : "bg-[#F2EDE4] border-transparent text-[#6E6A65] hover:border-[#E9E3DB]"
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
