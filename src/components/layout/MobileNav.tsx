"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Users, Home, Calendar, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/map",      label: "Map",      icon: Map },
  { href: "/people",   label: "People",   icon: Users },
  { href: "/circles",  label: "Circles",  icon: Home },
  { href: "/events",   label: "Events",   icon: Calendar },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profile",  label: "Me",       icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-[#EDE7DF] z-40 pb-safe">
      <div className="flex max-w-2xl mx-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[10px] font-medium transition-all",
                active ? "text-[#F47A5C]" : "text-[#9B9690]"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-5 rounded-full transition-all",
                active && "bg-[#FFF0EE]"
              )}>
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
