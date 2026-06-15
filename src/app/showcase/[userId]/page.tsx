"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAppStore } from "@/store/useAppStore";
import { cn, formatShortDate, getCategoryColors } from "@/lib/utils";
import CoveAvatar from "@/components/ui/CoveAvatar";
import type { ShowcaseReaction } from "@/lib/types";

const REACTIONS: { key: ShowcaseReaction; emoji: string; label: string }[] = [
  { key: "collab",    emoji: "🔥", label: "Want to Collab" },
  { key: "inspired",  emoji: "👏", label: "Inspired"       },
  { key: "feedback",  emoji: "💡", label: "Have Feedback"  },
];

export default function ShowcasePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { users } = useAppStore();
  const user = users.find((u) => u.id === userId);
  const [reacted, setReacted] = useState<Record<string, Set<ShowcaseReaction>>>({});
  const [counts, setCounts] = useState<Record<string, Record<ShowcaseReaction, number>>>(() => {
    const init: Record<string, Record<ShowcaseReaction, number>> = {};
    user?.showcaseItems.forEach((item) => { init[item.id] = { ...item.reactions }; });
    return init;
  });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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
    if (hasReacted) { newSet.delete(reaction); } else { newSet.add(reaction); }
    setReacted((r) => ({ ...r, [itemId]: newSet }));
    setCounts((c) => ({
      ...c,
      [itemId]: { ...c[itemId], [reaction]: (c[itemId]?.[reaction] ?? 0) + (hasReacted ? -1 : 1) },
    }));
  };

  const categories = [...new Set(user.showcaseItems.map((i) => i.category))];
  const filtered = activeCategory
    ? user.showcaseItems.filter((i) => i.category === activeCategory)
    : user.showcaseItems;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Back */}
        <Link href={`/profile/${user.id}`} className="flex items-center gap-1.5 text-sm text-[#6E6A65] hover:text-[#F47A5C] mb-5">
          <ArrowLeft size={15} /> {user.name}
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="rounded-2xl overflow-hidden border-2 border-[#E9E3DB]"
            style={{ width: 52, height: 52 }}
          >
            <CoveAvatar src={user.avatar} name={user.name} size={52} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#2F2A26]">{user.name}&apos;s Showcase</h1>
            <p className="text-sm text-[#6E6A65] mt-0.5">{user.showcaseItems.length} projects &amp; creations</p>
          </div>
        </div>

        {/* Category filter pills */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all",
                activeCategory === null
                  ? "bg-[#F47A5C] text-white"
                  : "bg-[#EDE7DF] text-[#6E6A65] hover:bg-[#E9E3DB]"
              )}
            >
              All
            </button>
            {categories.map((cat) => {
              const c = getCategoryColors(cat);
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(isActive ? null : cat)}
                  className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border"
                  style={isActive
                    ? { backgroundColor: c.color, color: "#fff", borderColor: c.color }
                    : { backgroundColor: c.background, color: c.color, borderColor: "transparent" }
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-[#F2EDE4] rounded-2xl">
            <p className="text-[#6E6A65]">Nothing here yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => {
              const catColors = getCategoryColors(item.category);
              return (
                <div
                  key={item.id}
                  className="bg-[#FFFDFC] rounded-2xl overflow-hidden hover-lift border border-[#E9E3DB]"
                  style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)" }}
                >
                  {/* Cover — zoom on hover */}
                  <div className="relative h-52 overflow-hidden showcase-zoom-wrap">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="showcase-zoom-img w-full h-full object-cover"
                      draggable={false}
                    />
                    {/* Category badge on image */}
                    <div className="absolute top-3 left-3">
                      <span
                        className="text-[10px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm"
                        style={{
                          backgroundColor: catColors.background + "E0",
                          color: catColors.color,
                        }}
                      >
                        {item.category}
                      </span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-[#2F2A26]">{item.title}</h3>
                    <p className="text-xs text-[#6E6A65] mt-1.5 line-clamp-3 leading-relaxed">{item.description}</p>

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
                              "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all",
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
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
