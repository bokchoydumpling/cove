"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Users, Home, Calendar, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/map", label: "Map", icon: Map },
  { href: "/people", label: "People", icon: Users },
  { href: "/circles", label: "Circles", icon: Home },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E4DC] flex z-40 md:hidden">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium transition-colors",
              active ? "text-[#E8734A]" : "text-[#9E9790]"
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
