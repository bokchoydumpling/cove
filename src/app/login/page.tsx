"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Check } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#F47A5C] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-semibold">C</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#2F2A26]">Welcome to Cove</h1>
          <p className="text-[#6E6A65] text-sm mt-2">
            Discover interesting people, communities, and events around you.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E9E3DB] p-6 shadow-sm">
          {!sent ? (
            <>
              <h2 className="text-base font-medium text-[#2F2A26] mb-1">Sign in</h2>
              <p className="text-xs text-[#6E6A65] mb-5">
                We&apos;ll send you a magic link — no password needed.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="relative mb-4">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9690]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-9 pr-4 py-3 border border-[#E9E3DB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47A5C]/30 focus:border-[#F47A5C]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 bg-[#F47A5C] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#E0674A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Send Magic Link <ArrowRight size={15} /></>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-[#EBF5EE] rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={22} className="text-[#8BB8A8]" />
              </div>
              <h2 className="text-base font-medium text-[#2F2A26] mb-1">Check your email</h2>
              <p className="text-xs text-[#6E6A65] leading-relaxed">
                We sent a magic link to <strong>{email}</strong>. Click it to sign in to Cove.
              </p>
            </div>
          )}
        </div>

        {/* Demo bypass */}
        <div className="mt-4 text-center">
          <Link
            href="/map"
            className="text-xs text-[#9B9690] hover:text-[#6E6A65] underline"
          >
            Explore without signing in →
          </Link>
        </div>

        <p className="text-[10px] text-[#9B9690] text-center mt-4">
          By continuing, you agree to Cove&apos;s community guidelines and privacy policy.
        </p>
      </div>
    </div>
  );
}
