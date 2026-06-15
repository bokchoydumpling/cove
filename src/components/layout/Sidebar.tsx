"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Users, MessageCircle, Calendar, Zap, User, Home } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import CoveAvatar from "@/components/ui/CoveAvatar";

const NAV = [
  { href: "/map",      label: "Map",      icon: Map },
  { href: "/people",   label: "People",   icon: Users },
  { href: "/circles",  label: "Circles",  icon: Home },
  { href: "/events",   label: "Events",   icon: Calendar },
  { href: "/messages", label: "Messages", icon: MessageCircle, badge: 2 },
  { href: "/activity", label: "Activity", icon: Zap },
];

export default function Sidebar() {
  const pathname = usePathname();
  const currentUser = useAppStore((s) => s.currentUser);

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white/95 backdrop-blur-sm border-r border-[#EDE7DF] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#EDE7DF]">
        <Link href="/map" className="flex items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(135deg, #F47A5C, #F4A574)" }}
          >
            <span className="text-white text-base font-semibold">C</span>
          </div>
          <div>
            <span
              className="font-semibold text-lg tracking-tight"
              style={{ background: "linear-gradient(135deg, #F47A5C, #E0674A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              Cove
            </span>
          </div>
        </Link>
        <p className="text-[#9B9690] text-[11px] mt-1 pl-0.5 font-medium">SF + Oakland 🌉</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-150",
                active
                  ? "text-white shadow-sm"
                  : "text-[#6E6A65] hover:bg-[#F2EDE4] hover:text-[#2F2A26]"
              )}
              style={active ? { background: "linear-gradient(135deg, #F47A5C, #F4A574)" } : {}}
            >
              <Icon size={17} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
              {badge && (
                <span
                  className={cn(
                    "ml-auto text-[10px] font-semibold rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-[18px] px-1",
                    active ? "bg-white/30 text-white" : "bg-[#F47A5C] text-white"
                  )}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Discovery nudge */}
      <div
        className="mx-3 mb-3 p-3 rounded-2xl border"
        style={{ background: "linear-gradient(135deg, #FFF7ED, #FDF8F0)", borderColor: "#F4CFBC" }}
      >
        <p className="text-xs font-medium text-[#D05A3D] mb-0.5">✨ Nearby this week</p>
        <p className="text-[11px] text-[#2F2A26] leading-relaxed">3 people near you are also into AI.</p>
      </div>

      {/* Profile */}
      <div className="px-3 pb-4 pt-3 border-t border-[#EDE7DF]">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all",
            pathname === "/profile"
              ? "bg-[#FFF0EE]"
              : "hover:bg-[#F2EDE4]"
          )}
        >
          <div style={{
            width: 34, height: 34,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            flexShrink: 0,
          }}>
            <CoveAvatar src={currentUser.avatar} name={currentUser.name} size={34} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#2F2A26] truncate">{currentUser.name}</p>
            <p className="text-[11px] text-[#9B9690] flex items-center gap-1">
              {currentUser.streakCount >= 7 && "🔥"}
              {currentUser.streakCount}d streak · {currentUser.communityScore.total} pts
            </p>
          </div>
          <User size={13} className="text-[#9B9690] shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
