import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cove — Discover Your City",
  description: "Discover interesting people, communities, projects, and events around you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
