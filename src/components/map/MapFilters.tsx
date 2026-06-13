"use client";
import { useState } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import type { Profession, Interest, LookingFor, Availability } from "@/lib/types";

const PROFESSIONS: Profession[] = [
  "Software Engineer","Designer","Marketer","Founder","Artist","Musician",
  "Photographer","Student","Nonprofit","Writer","Food Creator","Fitness",
];
const INTERESTS: Interest[] = [
  "AI","Startups","Coffee","Fitness","Books","Fashion","Photography",
  "Music","Volunteering","Hiking","Food","Local Events","Art","Film","Sustainability",
];
const LOOKING_FOR: LookingFor[] = [
  "Friends","Collaborators","Community","Creative Feedback","Mentorship","Coffee Chats","Project Partners",
];
const AVAILABILITY: Availability[] = [
  "Open to Meet","Open to Chat","Attending Events","Exploring","Just Browsing",
];
const DISTANCES = ["Same Neighborhood","1 Mile","5 Miles","Entire City"];

function FilterChip<T extends string>({
  label, selected, onToggle,
}: { label: T; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
        selected
          ? "bg-[#E8734A] text-white border-[#E8734A]"
          : "bg-white text-[#4A4A4A] border-[#E8E4DC] hover:border-[#E8734A] hover:text-[#E8734A]"
      )}
    >
      {label}
    </button>
  );
}

export default function MapFilters() {
  const { mapFilter, setMapFilter } = useAppStore();
  const [open, setOpen] = useState(false);

  const activeCount =
    mapFilter.professions.length +
    mapFilter.interests.length +
    mapFilter.lookingFor.length +
    mapFilter.availability.length +
    (mapFilter.distance !== "Entire City" ? 1 : 0);

  const toggle = <T extends string>(key: keyof typeof mapFilter, val: T) => {
    const current = mapFilter[key] as T[];
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    setMapFilter({ [key]: next });
  };

  const clear = () =>
    setMapFilter({ professions: [], interests: [], lookingFor: [], availability: [], distance: "Entire City" });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all shadow-sm",
          open || activeCount > 0
            ? "bg-[#E8734A] text-white border-[#E8734A]"
            : "bg-white text-[#3D3D3D] border-[#E8E4DC] hover:border-[#E8734A]"
        )}
      >
        <Filter size={14} />
        Filters
        {activeCount > 0 && (
          <span className="bg-white text-[#E8734A] text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {activeCount}
          </span>
        )}
        <ChevronDown size={14} className={cn("transition-transform", open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-[480px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-[#E8E4DC] shadow-xl z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1A1A1A]">Filter People</h3>
            <div className="flex gap-2">
              {activeCount > 0 && (
                <button
                  onClick={clear}
                  className="text-xs text-[#E8734A] font-medium hover:underline"
                >
                  Clear all
                </button>
              )}
              <button onClick={() => setOpen(false)}>
                <X size={16} className="text-[#737373]" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <Section label="Profession">
              {PROFESSIONS.map((p) => (
                <FilterChip
                  key={p}
                  label={p}
                  selected={mapFilter.professions.includes(p)}
                  onToggle={() => toggle("professions", p)}
                />
              ))}
            </Section>

            <Section label="Interests">
              {INTERESTS.map((i) => (
                <FilterChip
                  key={i}
                  label={i}
                  selected={mapFilter.interests.includes(i)}
                  onToggle={() => toggle("interests", i)}
                />
              ))}
            </Section>

            <Section label="Looking For">
              {LOOKING_FOR.map((l) => (
                <FilterChip
                  key={l}
                  label={l}
                  selected={mapFilter.lookingFor.includes(l)}
                  onToggle={() => toggle("lookingFor", l)}
                />
              ))}
            </Section>

            <Section label="Availability">
              {AVAILABILITY.map((a) => (
                <FilterChip
                  key={a}
                  label={a}
                  selected={mapFilter.availability.includes(a)}
                  onToggle={() => toggle("availability", a)}
                />
              ))}
            </Section>

            <Section label="Distance">
              {DISTANCES.map((d) => (
                <FilterChip
                  key={d}
                  label={d as Availability}
                  selected={mapFilter.distance === d}
                  onToggle={() => setMapFilter({ distance: d })}
                />
              ))}
            </Section>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-[#B0ABA3] uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
