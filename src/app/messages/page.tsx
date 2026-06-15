"use client";
import { useState } from "react";
import { Search, Send } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAppStore } from "@/store/useAppStore";
import { cn, formatRelativeTime } from "@/lib/utils";
import CoveAvatar from "@/components/ui/CoveAvatar";
import type { User } from "@/lib/types";

const MOCK_CONVERSATIONS = [
  {
    id: "dm1",
    type: "direct" as const,
    userId: "u3",
    lastMessage: "That dinner sounds amazing — I'll bring the adobo!",
    timestamp: "2026-06-12T09:30:00Z",
    unread: 1,
  },
  {
    id: "dm2",
    type: "direct" as const,
    userId: "u9",
    lastMessage: "Let me know when you're free for coffee",
    timestamp: "2026-06-11T18:00:00Z",
    unread: 0,
  },
  {
    id: "dm3",
    type: "circle" as const,
    name: "SF AI Builders",
    emoji: "🤖",
    lastMessage: "Maya: Anyone going to the demo night?",
    timestamp: "2026-06-12T08:00:00Z",
    unread: 3,
  },
  {
    id: "dm4",
    type: "event" as const,
    name: "SF AI Builders — Demos & Drinks",
    emoji: "🎉",
    lastMessage: "The venue is confirmed at 340 Pine St",
    timestamp: "2026-06-11T14:00:00Z",
    unread: 1,
  },
];

const MOCK_MESSAGES: Record<string, Array<{ id: string; senderId: string; content: string; timestamp: string }>> = {
  dm1: [
    { id: "m1", senderId: "u3", content: "Hey Maya! Loved your showcase post about Journo AI.", timestamp: "2026-06-12T09:00:00Z" },
    { id: "m2", senderId: "u1", content: "Thanks so much! What did you think of the research workflow?", timestamp: "2026-06-12T09:10:00Z" },
    { id: "m3", senderId: "u3", content: "It's exactly what journalists need. I showed my friend who's an investigative reporter.", timestamp: "2026-06-12T09:20:00Z" },
    { id: "m4", senderId: "u3", content: "That dinner sounds amazing — I'll bring the adobo!", timestamp: "2026-06-12T09:30:00Z" },
  ],
  dm2: [
    { id: "m5", senderId: "u9", content: "Hey! I saw you're into AI tools too. Working on anything fun right now?", timestamp: "2026-06-11T17:30:00Z" },
    { id: "m6", senderId: "u1", content: "Yeah! Building Journo AI — an AI research assistant for journalists.", timestamp: "2026-06-11T17:45:00Z" },
    { id: "m7", senderId: "u9", content: "Let me know when you're free for coffee", timestamp: "2026-06-11T18:00:00Z" },
  ],
};

export default function MessagesPage() {
  const { users } = useAppStore();
  const [selected, setSelected] = useState<string>("dm1");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [search, setSearch] = useState("");

  const getUser = (id: string): User | undefined => users.find((u) => u.id === id);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: `m${Date.now()}`,
      senderId: "u1",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => ({
      ...prev,
      [selected]: [...(prev[selected] || []), newMsg],
    }));
    setInput("");
  };

  const selectedConv = MOCK_CONVERSATIONS.find((c) => c.id === selected);
  const selectedMessages = messages[selected] || [];

  const convName = (conv: typeof MOCK_CONVERSATIONS[0]) => {
    if (conv.type === "direct") {
      const u = getUser(conv.userId);
      return u?.name ?? "Unknown";
    }
    return conv.name ?? "";
  };

  return (
    <AppShell>
      <div className="h-screen flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 border-r border-[#E9E3DB] flex flex-col bg-white">
          <div className="px-4 py-4 border-b border-[#E9E3DB]">
            <h1 className="text-lg font-semibold text-[#2F2A26] mb-3">Messages</h1>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9690]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full pl-8 pr-3 py-2 bg-[#F2EDE4] rounded-xl text-xs placeholder-[#9B9690] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {MOCK_CONVERSATIONS.map((conv) => {
              const user = conv.type === "direct" ? getUser(conv.userId) : null;
              const name = convName(conv);
              const emoji = conv.type !== "direct" ? conv.emoji : undefined;

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv.id)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                    selected === conv.id ? "bg-[#FEEEEA]" : "hover:bg-[#F2EDE4]"
                  )}
                >
                  {user ? (
                    <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                      <CoveAvatar src={user.avatar} name={user.name} size={36} />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#EDE7DF] flex items-center justify-center text-lg shrink-0">
                      {emoji}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#2F2A26] truncate">{name}</span>
                      <span className="text-[10px] text-[#9B9690] shrink-0 ml-1">{formatRelativeTime(conv.timestamp)}</span>
                    </div>
                    <p className="text-[11px] text-[#6E6A65] truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="w-4 h-4 bg-[#F47A5C] text-white text-[9px] font-semibold rounded-full flex items-center justify-center shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        {selectedConv ? (
          <div className="flex-1 flex flex-col bg-[#F8F6F1]">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[#E9E3DB] bg-white flex items-center gap-3">
              {selectedConv.type === "direct" ? (() => {
                const u = getUser(selectedConv.userId);
                return u ? (
                  <>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden" }}>
                      <CoveAvatar src={u.avatar} name={u.name} size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#2F2A26]">{u.name}</p>
                      <p className="text-[10px] text-[#8BB8A8]">● {u.availability}</p>
                    </div>
                  </>
                ) : null;
              })() : (
                <>
                  <div className="w-8 h-8 rounded-full bg-[#EDE7DF] flex items-center justify-center text-lg">
                    {selectedConv.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2F2A26]">{selectedConv.name}</p>
                    <p className="text-[10px] text-[#9B9690]">{selectedConv.type === "circle" ? "Circle chat" : "Event group"}</p>
                  </div>
                </>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {selectedMessages.map((msg) => {
                const isMe = msg.senderId === "u1";
                const sender = getUser(msg.senderId);
                return (
                  <div key={msg.id} className={cn("flex gap-2.5", isMe ? "flex-row-reverse" : "")}>
                    {!isMe && sender && (
                      <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                        <CoveAvatar src={sender.avatar} name={sender.name} size={28} />
                      </div>
                    )}
                    <div className={cn("max-w-xs", isMe ? "items-end" : "items-start", "flex flex-col")}>
                      <div
                        className={cn(
                          "px-3.5 py-2.5 rounded-2xl text-sm",
                          isMe
                            ? "bg-[#F47A5C] text-white rounded-tr-sm"
                            : "bg-white border border-[#E9E3DB] text-[#2F2A26] rounded-tl-sm"
                        )}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-[#9B9690] mt-1">{formatRelativeTime(msg.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="px-5 py-3 border-t border-[#E9E3DB] bg-white">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message…"
                  className="flex-1 px-4 py-2.5 bg-[#F2EDE4] rounded-xl text-sm placeholder-[#9B9690] focus:outline-none focus:ring-2 focus:ring-[#F47A5C]/30"
                />
                <button
                  onClick={sendMessage}
                  className="w-9 h-9 bg-[#F47A5C] rounded-xl flex items-center justify-center text-white hover:bg-[#E0674A] transition-colors shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#6E6A65] text-sm">Select a conversation</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
