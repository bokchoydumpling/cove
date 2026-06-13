"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Users, MessageCircle, Calendar, Zap, User, Home } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn, getInitials, getAvatarColor } from "@/lib/utils";

const NAV = [
  { href: "/map", label: "Map", icon: Map },
  { href: "/people", label: "People", icon: Users },
  { href: "/circles", label: "Circles", icon: Home },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/activity", label: "Activity", icon: Zap },
];

export default function Sidebar() {
  const pathname = usePathname();
  const currentUser = useAppStore((s) => s.currentUser);

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-[#E8E4DC] flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#E8E4DC]">
        <Link href="/map" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E8734A] flex items-center justify-center">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <span className="text-[#1A1A1A] font-semibold text-lg tracking-tight">Cove</span>
        </Link>
        <p className="text-[#737373] text-xs mt-1 pl-0.5">San Francisco + Oakland</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-[#FDF0EB] text-[#E8734A]"
                  : "text-[#4A4A4A] hover:bg-[#F5F0E8] hover:text-[#1A1A1A]"
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {label}
              {label === "Messages" && (
                <span className="ml-auto bg-[#E8734A] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  2
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Discovery prompt */}
      <div className="mx-3 mb-3 p-3 bg-[#FDF5F0] rounded-xl border border-[#F4CFBC]">
        <p className="text-xs text-[#B35C2E] font-medium mb-1">✨ Nearby this week</p>
        <p className="text-xs text-[#6B4030]">3 people near you are also into AI.</p>
      </div>

      {/* Profile */}
      <div className="px-3 pb-4 border-t border-[#E8E4DC] pt-3">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
            pathname === "/profile"
              ? "bg-[#FDF0EB]"
              : "hover:bg-[#F5F0E8]"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0",
              getAvatarColor(currentUser.name),
              currentUser.streakCount >= 7 ? "streak-glow" : ""
            )}
          >
            {getInitials(currentUser.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#1A1A1A] truncate">{currentUser.name}</p>
            <p className="text-xs text-[#737373] flex items-center gap-1">
              {currentUser.streakCount >= 7 && <span className="text-[#E8734A]">🔥</span>}
              {currentUser.streakCount}d streak · {currentUser.communityScore.total} pts
            </p>
          </div>
          <User size={14} className="ml-auto text-[#B0ABA3] shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
