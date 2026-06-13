import type { Badge } from "@/lib/types";
import { formatShortDate } from "@/lib/utils";

interface Props {
  badges: Badge[];
  compact?: boolean;
}

export default function BadgeList({ badges, compact = false }: Props) {
  if (badges.length === 0) return null;
  if (compact) {
    return (
      <div className="flex gap-1 flex-wrap">
        {badges.map((b) => (
          <span key={b.type} title={b.label} className="text-lg cursor-default">
            {b.emoji}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
      <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Badges</h3>
      <div className="grid grid-cols-2 gap-2">
        {badges.map((b) => (
          <div key={b.type} className="flex items-center gap-2 bg-[#F5F0E8] rounded-xl px-3 py-2">
            <span className="text-xl">{b.emoji}</span>
            <div>
              <p className="text-xs font-medium text-[#1A1A1A]">{b.label}</p>
              <p className="text-[10px] text-[#B0ABA3]">{formatShortDate(b.earnedAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
