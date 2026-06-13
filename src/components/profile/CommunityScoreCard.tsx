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
    <div className="h-1.5 bg-[#F0EDE6] rounded-full overflow-hidden">
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
        <span className="text-xl font-bold text-[#E8734A]">{score.total}</span>
        <div>
          <p className="text-xs font-semibold text-[#1A1A1A]">{level.label}</p>
          <p className="text-[10px] text-[#737373]">Community Score</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Community Score</h3>
          <p className={`text-xs font-medium mt-0.5 ${level.color}`}>{level.label}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-[#E8734A]">{score.total}</p>
          <p className="text-[10px] text-[#B0ABA3]">total points</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#4A4A4A] font-medium">🔨 Builder Score</span>
            <span className="font-semibold text-[#1A1A1A]">{score.builder}</span>
          </div>
          <ScoreBar value={score.builder} color="#E8734A" />
          <p className="text-[10px] text-[#B0ABA3] mt-0.5">Earned through showcase posts & project updates</p>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#4A4A4A] font-medium">🔗 Connector Score</span>
            <span className="font-semibold text-[#1A1A1A]">{score.connector}</span>
          </div>
          <ScoreBar value={score.connector} color="#7B9E87" />
          <p className="text-[10px] text-[#B0ABA3] mt-0.5">Earned through events attended & introductions</p>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#4A4A4A] font-medium">🏘️ Neighbor Score</span>
            <span className="font-semibold text-[#1A1A1A]">{score.neighbor}</span>
          </div>
          <ScoreBar value={score.neighbor} color="#9B8EC4" />
          <p className="text-[10px] text-[#B0ABA3] mt-0.5">Earned through circle activity & helping members</p>
        </div>
      </div>
    </div>
  );
}
