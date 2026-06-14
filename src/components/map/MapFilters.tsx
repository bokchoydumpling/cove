"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import type { Profession, Interest, LookingFor, Availability } from "@/lib/types";

const PROFESSIONS: Profession[] = [
  "Software Engineer","Designer","Marketer","Founder","Artist","Musician",
  "Photographer","Student","Nonprofit","Writer","Food Creator","Fitness",
];
const INTERESTS: Interest[] = [
  "AI","Startups","Coffee","Fitness","Books","Fashion","Photography",
  "Music","Volunteering","Hiking","Food","Local Events",
];
const LOOKING_FOR: LookingFor[] = [
  "Friends","Collaborators","Community","Creative Feedback","Mentorship","Coffee Chats","Project Partners",
];
const AVAILABILITY: Availability[] = [
  "Open to Meet","Open to Chat","Attending Events","Exploring","Just Browsing",
];

type Category = "professions" | "interests" | "lookingFor" | "availability";

const CATEGORIES: { key: Category; label: string; options: string[] }[] = [
  { key: "professions", label: "Profession", options: PROFESSIONS },
  { key: "interests",   label: "Interests",  options: INTERESTS },
  { key: "lookingFor",  label: "Looking For", options: LOOKING_FOR },
  { key: "availability",label: "Availability", options: AVAILABILITY },
];

export default function MapFilters() {
  const { mapFilter, setMapFilter } = useAppStore();
  const [openCategory, setOpenCategory] = useState<Category | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCount =
    mapFilter.professions.length +
    mapFilter.interests.length +
    mapFilter.lookingFor.length +
    mapFilter.availability.length;

  const toggle = (key: Category, val: string) => {
    const current = mapFilter[key] as string[];
    const next = current.includes(val) ? current.filter((v) => v !== val) : [...current, val];
    setMapFilter({ [key]: next });
  };

  const clearAll = () =>
    setMapFilter({ professions: [], interests: [], lookingFor: [], availability: [], distance: "Entire City" });

  // Close dropdown on outside click
  useEffect(() => {
    if (!openCategory) return;
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenCategory(null);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [openCategory]);

  return (
    <div ref={containerRef} className="flex items-center gap-2">
      {CATEGORIES.map(({ key, label, options }) => {
        const selected = mapFilter[key] as string[];
        const isActive = selected.length > 0;
        const isOpen = openCategory === key;

        return (
          <div key={key} className="relative shrink-0">
            <button
              onClick={() => setOpenCategory(isOpen ? null : key)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap shadow-sm",
                isActive || isOpen
                  ? "bg-[#E8734A] text-white border-[#E8734A]"
                  : "bg-white/90 text-[#3D3D3D] border-[#E8E4DC] hover:border-[#E8734A] hover:text-[#E8734A] backdrop-blur-sm"
              )}
            >
              {label}
              {isActive && (
                <span className="bg-white/30 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {selected.length}
                </span>
              )}
              <ChevronDown size={11} className={cn("transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl border border-[#E8E4DC] shadow-xl z-50 p-3 min-w-[200px] max-w-[280px]">
                <div className="flex flex-wrap gap-1.5">
                  {options.map((opt) => {
                    const on = selected.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => toggle(key, opt)}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all",
                          on
                            ? "bg-[#E8734A] text-white border-[#E8734A]"
                            : "bg-white text-[#4A4A4A] border-[#E8E4DC] hover:border-[#E8734A] hover:text-[#E8734A]"
                        )}
                      >
                        {on && <Check size={9} strokeWidth={3} />}
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {selected.length > 0 && (
                  <button
                    onClick={() => setMapFilter({ [key]: [] })}
                    className="mt-2 text-[10px] text-[#E8734A] font-medium hover:underline"
                  >
                    Clear {label.toLowerCase()}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium text-[#737373] hover:text-[#E8734A] bg-white/80 backdrop-blur-sm border border-[#E8E4DC] transition-colors whitespace-nowrap shadow-sm"
        >
          <X size={11} />
          Clear all
        </button>
      )}
    </div>
  );
}
