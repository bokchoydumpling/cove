"use client";
import Link from "next/link";
import { Search, Users, MessageSquare } from "lucide-react";
import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Technology", "Design", "Arts & Culture", "Photography", "Neighborhood", "Social Impact", "Writing", "Collaboration", "Outdoors", "Fitness"];

export default function CirclesPage() {
  const { circles } = useAppStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = circles.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !c.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "All" && c.category !== category) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#2F2A26]">Circles 🏡</h1>
          <p className="text-[#6E6A65] text-sm mt-1">Communities for every interest, neighborhood, and vibe.</p>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9690]" />
          <input
            type="text"
            placeholder="Search circles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#E9E3DB] rounded-2xl text-sm placeholder-[#9B9690] focus:outline-none focus:ring-2 focus:ring-[#F47A5C]/25 focus:border-[#F47A5C] transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                category === cat
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white text-[#6E6A65] border-[#E9E3DB] hover:border-[#F47A5C] hover:text-[#F47A5C]"
              )}
              style={category === cat ? { background: "linear-gradient(135deg, #F47A5C, #F4A574)" } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((circle) => (
            <Link key={circle.id} href={`/circles/${circle.id}`}>
              <div className="bg-white rounded-3xl border border-[#EDE7DF] overflow-hidden hover-lift cursor-pointer">
                <div
                  className="h-28 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${circle.coverImage})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center text-lg shadow-sm">
                    {circle.emoji}
                  </div>
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="text-white text-[10px] font-medium">{circle.category}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#2F2A26] text-sm">{circle.name}</h3>
                  <p className="text-xs text-[#6E6A65] mt-1 line-clamp-2">{circle.description}</p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#E9E3DB]">
                    <div className="flex items-center gap-1 text-[#6E6A65]">
                      <Users size={13} />
                      <span className="text-xs font-medium">{circle.memberCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#6E6A65]">
                      <MessageSquare size={13} />
                      <span className="text-xs font-medium">{circle.posts.length} posts</span>
                    </div>
                    <div className="ml-auto flex gap-1 flex-wrap">
                      {circle.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: ["#EEF8F4", "#F0EEFF"][idx % 2],
                            color: ["#2A7A5A", "#6B4EC4"][idx % 2],
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
