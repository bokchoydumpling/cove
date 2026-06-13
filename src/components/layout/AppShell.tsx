"use client";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Sidebar />
      <MobileNav />
      <main className="md:pl-60 pb-16 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
