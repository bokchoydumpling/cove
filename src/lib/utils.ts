import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isToday, isTomorrow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatEventDate(date: string, time: string): string {
  const d = new Date(`${date}T${time}`);
  if (isToday(d)) return `Today at ${format(d, "h:mm a")}`;
  if (isTomorrow(d)) return `Tomorrow at ${format(d, "h:mm a")}`;
  return format(d, "EEE, MMM d 'at' h:mm a");
}

export function formatShortDate(date: string): string {
  return format(new Date(date), "MMM d");
}

export function formatFullDate(date: string): string {
  return format(new Date(date), "EEEE, MMMM d, yyyy");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColor(name: string): string {
  const colors = [
    "bg-[#E8734A]",
    "bg-[#7B9E87]",
    "bg-[#9B8EC4]",
    "bg-[#6BAED6]",
    "bg-[#F4A574]",
    "bg-[#A8D5BA]",
    "bg-[#D4A5A5]",
    "bg-[#B5C4D1]",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + "s"}`;
}

export function getScoreLevel(score: number): { label: string; color: string } {
  if (score >= 500) return { label: "Community Pillar", color: "text-[#E8734A]" };
  if (score >= 300) return { label: "Regular", color: "text-[#7B9E87]" };
  if (score >= 100) return { label: "Active", color: "text-[#9B8EC4]" };
  if (score >= 50) return { label: "Explorer", color: "text-[#6BAED6]" };
  return { label: "Newcomer", color: "text-[#737373]" };
}

export function getBadgeEmoji(type: string): string {
  const map: Record<string, string> = {
    first_event_hosted: "🏠",
    connector: "🔗",
    hundred_days: "🏅",
    circle_founder: "🌱",
    vouched_ten: "🤝",
    seven_day_streak: "🔥",
    thirty_day_streak: "💫",
    hundred_day_streak: "⭐",
    community_pillar: "🌟",
    early_member: "🐣",
    showcase_star: "✨",
  };
  return map[type] || "🏆";
}

export function getProfessionColor(profession: string): string {
  const map: Record<string, string> = {
    "Software Engineer": "#6BAED6",
    "Designer": "#9B8EC4",
    "Marketer": "#F4A574",
    "Founder": "#E8734A",
    "Artist": "#A8D5BA",
    "Musician": "#D4A5A5",
    "Photographer": "#B5C4D1",
    "Student": "#7B9E87",
    "Nonprofit": "#A8D5BA",
    "Writer": "#E8C49B",
    "Food Creator": "#F4A574",
    "Fitness": "#7B9E87",
  };
  return map[profession] || "#737373";
}

export function getAvailabilityColor(availability: string): string {
  const map: Record<string, string> = {
    "Open to Meet": "#7B9E87",
    "Open to Chat": "#6BAED6",
    "Attending Events": "#9B8EC4",
    "Exploring": "#E8734A",
    "Just Browsing": "#B5C4D1",
  };
  return map[availability] || "#737373";
}
