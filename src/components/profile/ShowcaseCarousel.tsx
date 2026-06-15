"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { ShowcaseItem } from "@/lib/types";
import { getCategoryColors } from "@/lib/utils";

interface Props {
  items: ShowcaseItem[];
  userId: string;
}

function ReactionButton({ emoji, count, onReact }: {
  emoji: string; label?: string; count: number; onReact: () => void;
}) {
  const [clicked, setClicked] = useState(false);
  const [localCount, setLocalCount] = useState(count);
  const handle = () => {
    if (!clicked) {
      setClicked(true);
      setLocalCount((n) => n + 1);
    } else {
      setClicked(false);
      setLocalCount((n) => n - 1);
    }
    onReact();
  };
  return (
    <button
      onClick={handle}
      className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border transition-all ${
        clicked
          ? "bg-[#FEEEEA] border-[#F47A5C] text-[#F47A5C]"
          : "bg-[#F2EDE4] border-transparent text-[#6E6A65] hover:border-[#E9E3DB]"
      }`}
    >
      <span>{emoji}</span>
      <span className="opacity-80">{localCount}</span>
    </button>
  );
}

function ShowcaseItemCard({ item }: { item: ShowcaseItem }) {
  const catColors = getCategoryColors(item.category);

  return (
    <div
      className="shrink-0 w-56 bg-[#FFFDFC] rounded-2xl overflow-hidden hover-lift cursor-pointer border border-[#E9E3DB]"
      style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)" }}
    >
      {/* Cover image — zoom on hover */}
      <div className="relative h-36 overflow-hidden showcase-zoom-wrap">
        <img
          src={item.coverImage}
          alt={item.title}
          className="showcase-zoom-img w-full h-full object-cover"
          draggable={false}
        />
        {/* Category badge floating on the image */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm"
            style={{
              backgroundColor: catColors.background + "E0",
              color: catColors.color,
            }}
          >
            {item.category}
          </span>
        </div>
        {/* Subtle bottom scrim */}
        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-black/15 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-xs font-semibold text-[#2F2A26] leading-snug line-clamp-2">{item.title}</p>
        {item.description && (
          <p className="text-[11px] text-[#6E6A65] mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
        )}
        <div className="flex gap-1.5 mt-2.5">
          <ReactionButton emoji="🔥" label="Collab"    count={item.reactions.collab}    onReact={() => {}} />
          <ReactionButton emoji="👏" label="Inspired"  count={item.reactions.inspired}  onReact={() => {}} />
        </div>
      </div>
    </div>
  );
}

export default function ShowcaseCarousel({ items, userId }: Props) {
  if (items.length === 0) {
    return (
      <div className="bg-[#F2EDE4] rounded-2xl p-8 text-center">
        <p className="text-sm text-[#6E6A65]">No showcase items yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#2F2A26]">Showcase</h3>
        <Link
          href={`/showcase/${userId}`}
          className="flex items-center gap-0.5 text-xs text-[#F47A5C] font-medium hover:underline"
        >
          View all <ChevronRight size={13} />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
        {items.map((item) => (
          <ShowcaseItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
