"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Send, Loader2, Users } from "lucide-react";

interface ChatWindowProps {
  groupId: string;
  currentUser: Doc<"users">;
}

export function ChatWindow({ groupId, currentUser }: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const group = useQuery(api.groups.getGroup, {
    groupId: groupId as Id<"groups">,
  });

  const messages = useQuery(api.messages.getGroupMessages, {
    groupId: groupId as Id<"groups">,
  });

  const sendMessage = useMutation(api.messages.sendMessage);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      await sendMessage({
        groupId: groupId as Id<"groups">,
        senderId: currentUser._id,
        content: message.trim(),
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!group || !messages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const displayName = group.isDirectMessage
    ? group.members.find((m) => m._id !== currentUser._id)?.username ||
      "Unknown"
    : group.name;

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-[var(--color-card)] border-b border-[var(--color-border)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-[var(--color-card-foreground)]">
                {displayName}
              </h2>
              <p className="text-xs text-[var(--color-muted-foreground)] flex items-center gap-1">
                <Users className="w-3 h-3" />
                {group.members.length} member
                {group.members.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--color-muted)]/40">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--color-muted-foreground)]">
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.senderId === currentUser._id;

            return (
              <div
                key={msg._id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage ? "items-end" : "items-start"
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs text-gray-500 mb-1 px-1">
                      {msg.sender?.username || "Unknown"}
                    </p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 shadow-sm ${
                      isOwnMessage
                        ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                        : "bg-[var(--color-card)] text-[var(--color-card-foreground)] border border-[var(--color-border)]"
                    }`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                  </div>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-[var(--color-card)] border-t border-[var(--color-border)] p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-[var(--color-input)] rounded-full bg-[var(--color-muted)]/40 text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-full hover:brightness-95 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
