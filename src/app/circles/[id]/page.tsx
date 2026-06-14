"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, ChevronUp, MessageSquare, Pin, Tag } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAppStore } from "@/store/useAppStore";
import { cn, formatRelativeTime } from "@/lib/utils";
import CoveAvatar from "@/components/ui/CoveAvatar";
import type { ForumPost, ForumReply } from "@/lib/types";

function ReplyItem({ reply, depth = 0 }: { reply: ForumReply; depth?: number }) {
  const [upvoted, setUpvoted] = useState(false);
  const [count, setCount] = useState(reply.upvotes);
  return (
    <div className={cn("flex gap-3", depth > 0 ? "pl-8 border-l-2 border-[#F0EDE6]" : "")}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
        <CoveAvatar src={reply.authorAvatar} name={reply.authorName} size={28} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#1A1A1A]">{reply.authorName}</span>
          <span className="text-[10px] text-[#B0ABA3]">{formatRelativeTime(reply.createdAt)}</span>
        </div>
        <p className="text-xs text-[#3D3D3D] mt-1 leading-relaxed">{reply.content}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <button
            onClick={() => { setUpvoted(!upvoted); setCount(c => upvoted ? c - 1 : c + 1); }}
            className={cn("flex items-center gap-1 text-[10px] font-medium", upvoted ? "text-[#E8734A]" : "text-[#B0ABA3] hover:text-[#737373]")}
          >
            <ChevronUp size={12} /> {count}
          </button>
        </div>
        {reply.replies?.map((r) => (
          <div key={r.id} className="mt-3">
            <ReplyItem reply={r} depth={depth + 1} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PostItem({ post }: { post: ForumPost }) {
  const [expanded, setExpanded] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [count, setCount] = useState(post.upvotes);

  const catColors: Record<string, string> = {
    Discussion: "bg-[#EBF0FB] text-[#3B5CC4]",
    Question: "bg-[#FFF3E0] text-[#C67A1E]",
    Resource: "bg-[#EBF5EE] text-[#3E8A54]",
    Event: "bg-[#F3EFFC] text-[#6B4EC4]",
  };

  return (
    <div className={cn("bg-white rounded-2xl border border-[#E8E4DC] p-4", post.isPinned ? "border-[#E8734A]/40 bg-[#FFFAF7]" : "")}>
      {post.isPinned && (
        <div className="flex items-center gap-1 mb-2">
          <Pin size={11} className="text-[#E8734A]" />
          <span className="text-[10px] font-semibold text-[#E8734A] uppercase tracking-wide">Pinned</span>
        </div>
      )}
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => { setUpvoted(!upvoted); setCount(c => upvoted ? c - 1 : c + 1); }}
            className={cn("p-1 rounded-lg transition-colors", upvoted ? "bg-[#FDF0EB] text-[#E8734A]" : "text-[#B0ABA3] hover:text-[#737373] hover:bg-[#F5F0E8]")}
          >
            <ChevronUp size={16} />
          </button>
          <span className={cn("text-xs font-bold", upvoted ? "text-[#E8734A]" : "text-[#737373]")}>{count}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", catColors[post.category] ?? "bg-[#F0EDE6] text-[#5A5450]")}>
              {post.category}
            </span>
            <span className="text-[10px] text-[#B0ABA3]">{formatRelativeTime(post.createdAt)}</span>
          </div>
          <h4 className="text-sm font-semibold text-[#1A1A1A] cursor-pointer hover:text-[#E8734A]" onClick={() => setExpanded(!expanded)}>
            {post.title}
          </h4>
          {expanded && (
            <p className="text-xs text-[#4A4A4A] mt-2 leading-relaxed">{post.body}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <div style={{ width: 20, height: 20, borderRadius: "50%", overflow: "hidden" }}>
              <CoveAvatar src={post.authorAvatar} name={post.authorName} size={20} />
            </div>
            <span className="text-[10px] text-[#737373]">{post.authorName}</span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[10px] text-[#737373] hover:text-[#E8734A] ml-auto"
            >
              <MessageSquare size={11} />
              {post.replies.length} replies
            </button>
          </div>
          {expanded && post.replies.length > 0 && (
            <div className="mt-4 space-y-4 pt-4 border-t border-[#F0EDE6]">
              {post.replies.map((r) => <ReplyItem key={r.id} reply={r} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CirclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { circles, users } = useAppStore();
  const circle = circles.find((c) => c.id === id);

  if (!circle) return (
    <AppShell>
      <div className="flex items-center justify-center h-64">
        <p className="text-[#737373]">Circle not found.</p>
      </div>
    </AppShell>
  );

  const members = circle.members.map((m) => users.find((u) => u.id === m.userId)).filter(Boolean);
  const sortedPosts = [...circle.posts].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Back */}
        <Link href="/circles" className="flex items-center gap-1.5 text-sm text-[#737373] hover:text-[#E8734A] mb-4">
          <ArrowLeft size={15} /> Circles
        </Link>

        {/* Cover */}
        <div
          className="w-full h-40 rounded-2xl bg-cover bg-center relative mb-5 overflow-hidden"
          style={{ backgroundImage: `url(${circle.coverImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-md">
              {circle.emoji}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{circle.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Users size={12} className="text-white/80" />
                <span className="text-xs text-white/80">{circle.memberCount.toLocaleString()} members</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Main: Forum */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1A1A1A]">Forum</h2>
              <span className="text-xs text-[#B0ABA3]">{circle.posts.length} posts</span>
            </div>
            {sortedPosts.map((post) => <PostItem key={post.id} post={post} />)}
            {circle.posts.length === 0 && (
              <div className="bg-[#F5F0E8] rounded-2xl p-8 text-center">
                <p className="text-sm text-[#737373]">No posts yet. Be the first.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* About */}
            <div className="bg-white rounded-2xl border border-[#E8E4DC] p-4">
              <h3 className="text-xs font-semibold text-[#1A1A1A] mb-2">About</h3>
              <p className="text-xs text-[#4A4A4A] leading-relaxed">{circle.description}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {circle.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-[10px] bg-[#F0EDE6] text-[#5A5450] px-2 py-0.5 rounded-full">
                    <Tag size={9} />{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Members */}
            <div className="bg-white rounded-2xl border border-[#E8E4DC] p-4">
              <h3 className="text-xs font-semibold text-[#1A1A1A] mb-3">Members</h3>
              <div className="space-y-2">
                {members.slice(0, 5).map((u) => u && (
                  <Link key={u.id} href={`/profile/${u.id}`} className="flex items-center gap-2 hover:opacity-80">
                    <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden" }}>
                      <CoveAvatar src={u.avatar} name={u.name} size={28} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#1A1A1A]">{u.name}</p>
                      <p className="text-[10px] text-[#B0ABA3]">{u.profession}</p>
                    </div>
                  </Link>
                ))}
                {circle.memberCount > 5 && (
                  <p className="text-[10px] text-[#B0ABA3] pt-1">+{circle.memberCount - 5} more members</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
