"use client";
import MobileNav from "./MobileNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <MobileNav />
      <main className="pb-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
