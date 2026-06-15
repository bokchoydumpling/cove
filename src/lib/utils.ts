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
    "bg-[#F47A5C]",  // coral
    "bg-[#8BB8A8]",  // sage
    "bg-[#B9A8D4]",  // lavender
    "bg-[#8DA9C4]",  // dusty blue
    "bg-[#E4B95B]",  // golden
    "bg-[#F4A574]",  // amber
    "bg-[#EDE7DF]",  // warm muted
    "bg-[#FEEEEA]",  // coral light
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
  if (score >= 500) return { label: "Community Pillar", color: "text-[#F47A5C]" };
  if (score >= 300) return { label: "Regular",          color: "text-[#8BB8A8]" };
  if (score >= 100) return { label: "Active",           color: "text-[#B9A8D4]" };
  if (score >= 50)  return { label: "Explorer",         color: "text-[#8DA9C4]" };
  return              { label: "Newcomer",              color: "text-[#6E6A65]" };
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

// Phase 1 palette — community identity colors per profession
export function getProfessionColor(profession: string): string {
  const map: Record<string, string> = {
    "Software Engineer": "#8BB8A8",  // sage — AI Builders
    "Designer":          "#B9A8D4",  // lavender — Creative District
    "Marketer":          "#E4B95B",  // golden yellow
    "Founder":           "#F47A5C",  // coral
    "Artist":            "#B9A8D4",  // lavender — Creative
    "Musician":          "#B9A8D4",  // lavender — Creative
    "Photographer":      "#8DA9C4",  // dusty blue
    "Student":           "#8BB8A8",  // sage
    "Nonprofit":         "#8BB8A8",  // sage — community
    "Writer":            "#E4B95B",  // golden — Book Lovers
    "Food Creator":      "#F47A5C",  // coral — Foodies
    "Fitness":           "#8DA9C4",  // dusty blue — Fitness Community
  };
  return map[profession] || "#9B9690";
}

export function getAvailabilityColor(availability: string): string {
  const map: Record<string, string> = {
    "Open to Meet":     "#8BB8A8",
    "Open to Chat":     "#8DA9C4",
    "Attending Events": "#B9A8D4",
    "Exploring":        "#F47A5C",
    "Just Browsing":    "#9B9690",
  };
  return map[availability] || "#9B9690";
}

// Community identity color for interest tags
export function getInterestColors(interest: string): { background: string; color: string } {
  if (["AI", "Startups", "Gaming", "Tech"].includes(interest))
    return { background: "#EAF4F0", color: "#1E7A68" };
  if (["Art", "Design", "Photography", "Music", "Film", "Fashion"].includes(interest))
    return { background: "#F0EEFF", color: "#6548B8" };
  if (["Food", "Coffee", "Cooking"].includes(interest))
    return { background: "#FFF0EE", color: "#C4522E" };
  if (["Fitness", "Hiking", "Sports", "Wellness"].includes(interest))
    return { background: "#E8F2FA", color: "#2E6E9A" };
  if (["Books", "Writing", "Literature", "Travel"].includes(interest))
    return { background: "#FDF6E3", color: "#8A6400" };
  if (["Volunteering", "Sustainability", "Local Events"].includes(interest))
    return { background: "#EAF4F0", color: "#1E7A68" };
  return { background: "#EDE7DF", color: "#6E6A65" };
}

// Community identity color for showcase categories
export function getCategoryColors(category: string): { background: string; color: string } {
  const map: Record<string, { background: string; color: string }> = {
    "Software":    { background: "#EAF4F0", color: "#1E7A68" },
    "Photography": { background: "#E8F2FA", color: "#2E6E9A" },
    "Art":         { background: "#F0EEFF", color: "#6548B8" },
    "Music":       { background: "#F0EEFF", color: "#6548B8" },
    "Nonprofit":   { background: "#EAF4F0", color: "#1E7A68" },
    "Marketing":   { background: "#FDF6E3", color: "#8A6400" },
    "Writing":     { background: "#FDF6E3", color: "#8A6400" },
    "Design":      { background: "#F0EEFF", color: "#6548B8" },
    "Food":        { background: "#FFF0EE", color: "#C4522E" },
    "Fitness":     { background: "#E8F2FA", color: "#2E6E9A" },
  };
  return map[category] ?? { background: "#EDE7DF", color: "#6E6A65" };
}
