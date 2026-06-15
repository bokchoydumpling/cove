import type { Vouch } from "@/lib/types";
import { formatRelativeTime, cn } from "@/lib/utils";
import CoveAvatar from "@/components/ui/CoveAvatar";

interface Props {
  vouches: Vouch[];
}

const VOUCH_COLORS: Record<string, string> = {
  "Met IRL": "bg-[#EBF5EE] text-[#3E8A54]",
  "Great Collaborator": "bg-[#EBF0FB] text-[#3B5CC4]",
  "Community Builder": "bg-[#FEEEEA] text-[#B35C2E]",
  "Creative Inspiration": "bg-[#F3EFFC] text-[#6B4EC4]",
};

export default function VouchSection({ vouches }: Props) {
  if (vouches.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-[#E9E3DB] p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[#2F2A26]">Vouches</h3>
        <span className="text-xs text-[#6E6A65]">{vouches.length} received</span>
      </div>
      <div className="space-y-3">
        {vouches.map((v) => (
          <div key={v.id} className="flex gap-3">
            <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
              <CoveAvatar src={v.giverAvatar} name={v.giverName} size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-[#2F2A26]">{v.giverName}</span>
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", VOUCH_COLORS[v.type] ?? "bg-[#F2EDE4] text-[#6E6A65]")}>
                  {v.type}
                </span>
              </div>
              {v.note && (
                <p className="text-xs text-[#6E6A65] mt-0.5 italic">&ldquo;{v.note}&rdquo;</p>
              )}
              <p className="text-[10px] text-[#9B9690] mt-0.5">{formatRelativeTime(v.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
