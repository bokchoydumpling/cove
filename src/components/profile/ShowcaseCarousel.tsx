"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { ShowcaseItem } from "@/lib/types";

interface Props {
  items: ShowcaseItem[];
  userId: string;
}

function ReactionButton({ emoji, label, count, onReact }: {
  emoji: string; label: string; count: number; onReact: () => void;
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
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
        clicked
          ? "bg-[#FEEEEA] border-[#F47A5C] text-[#F47A5C]"
          : "bg-[#F2EDE4] border-transparent text-[#6E6A65] hover:border-[#E9E3DB]"
      }`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      <span className="ml-0.5 text-[10px] opacity-70">{localCount}</span>
    </button>
  );
}

function ShowcaseItemCard({ item }: { item: ShowcaseItem }) {
  return (
    <div className="shrink-0 w-48 bg-white rounded-xl border border-[#E9E3DB] overflow-hidden hover-lift cursor-pointer">
      <div
        className="w-full h-28 bg-cover bg-center"
        style={{ backgroundImage: `url(${item.coverImage})` }}
      />
      <div className="p-2.5">
        <span className="text-[10px] font-medium text-[#9B8EC4] uppercase tracking-wide">{item.category}</span>
        <p className="text-xs font-medium text-[#2F2A26] mt-0.5 line-clamp-1">{item.title}</p>
        <div className="flex gap-1 mt-2 flex-wrap">
          <ReactionButton emoji="🔥" label="Collab" count={item.reactions.collab} onReact={() => {}} />
          <ReactionButton emoji="👏" label="Inspired" count={item.reactions.inspired} onReact={() => {}} />
        </div>
      </div>
    </div>
  );
}

export default function ShowcaseCarousel({ items, userId }: Props) {
  if (items.length === 0) {
    return (
      <div className="bg-[#F2EDE4] rounded-2xl p-6 text-center">
        <p className="text-sm text-[#6E6A65]">No showcase items yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[#2F2A26]">Showcase</h3>
        <Link
          href={`/showcase/${userId}`}
          className="flex items-center gap-0.5 text-xs text-[#F47A5C] font-medium hover:underline"
        >
          View all <ChevronRight size={13} />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {items.map((item) => (
          <ShowcaseItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
