import type { Vouch } from "@/lib/types";
import { getInitials, getAvatarColor, formatRelativeTime, cn } from "@/lib/utils";

interface Props {
  vouches: Vouch[];
}

const VOUCH_COLORS: Record<string, string> = {
  "Met IRL": "bg-[#EBF5EE] text-[#3E8A54]",
  "Great Collaborator": "bg-[#EBF0FB] text-[#3B5CC4]",
  "Community Builder": "bg-[#FDF0EB] text-[#B35C2E]",
  "Creative Inspiration": "bg-[#F3EFFC] text-[#6B4EC4]",
};

export default function VouchSection({ vouches }: Props) {
  if (vouches.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">Vouches</h3>
        <span className="text-xs text-[#737373]">{vouches.length} received</span>
      </div>
      <div className="space-y-3">
        {vouches.map((v) => (
          <div key={v.id} className="flex gap-3">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0",
                getAvatarColor(v.giverName)
              )}
            >
              {getInitials(v.giverName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-[#1A1A1A]">{v.giverName}</span>
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", VOUCH_COLORS[v.type] ?? "bg-[#F5F0E8] text-[#5A5450]")}>
                  {v.type}
                </span>
              </div>
              {v.note && (
                <p className="text-xs text-[#737373] mt-0.5 italic">&ldquo;{v.note}&rdquo;</p>
              )}
              <p className="text-[10px] text-[#B0ABA3] mt-0.5">{formatRelativeTime(v.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
