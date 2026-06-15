"use client";
import type { CommunityScore } from "@/lib/types";
import { getScoreLevel } from "@/lib/utils";

interface Props {
  score: CommunityScore;
  compact?: boolean;
}

function ScoreBar({ value, max = 300, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-1.5 bg-[#EDE7DF] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function CommunityScoreCard({ score, compact = false }: Props) {
  const level = getScoreLevel(score.total);
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold text-[#F47A5C]">{score.total}</span>
        <div>
          <p className="text-xs font-medium text-[#2F2A26]">{level.label}</p>
          <p className="text-[10px] text-[#6E6A65]">Community Score</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E9E3DB] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-[#2F2A26]">Community Score</h3>
          <p className={`text-xs font-medium mt-0.5 ${level.color}`}>{level.label}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold text-[#F47A5C]">{score.total}</p>
          <p className="text-[10px] text-[#9B9690]">total points</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#2F2A26] font-medium">🔨 Builder Score</span>
            <span className="font-medium text-[#2F2A26]">{score.builder}</span>
          </div>
          <ScoreBar value={score.builder} color="#F47A5C" />
          <p className="text-[10px] text-[#9B9690] mt-0.5">Earned through showcase posts & project updates</p>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#2F2A26] font-medium">🔗 Connector Score</span>
            <span className="font-medium text-[#2F2A26]">{score.connector}</span>
          </div>
          <ScoreBar value={score.connector} color="#8BB8A8" />
          <p className="text-[10px] text-[#9B9690] mt-0.5">Earned through events attended & introductions</p>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#2F2A26] font-medium">🏘️ Neighbor Score</span>
            <span className="font-medium text-[#2F2A26]">{score.neighbor}</span>
          </div>
          <ScoreBar value={score.neighbor} color="#9B8EC4" />
          <p className="text-[10px] text-[#9B9690] mt-0.5">Earned through circle activity & helping members</p>
        </div>
      </div>
    </div>
  );
}
