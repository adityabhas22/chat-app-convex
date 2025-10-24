"use client";

import { MessageSquare, Users, UserPlus } from "lucide-react";

interface WelcomeScreenProps {
  onShowFriends: () => void;
}

export function WelcomeScreen({ onShowFriends }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-[#0b0f1a] dark:to-[#0a0a0a]">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
          <MessageSquare className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-[var(--color-card-foreground)] mb-4">
          Welcome to Chat App
        </h1>

        <p className="text-[var(--color-muted-foreground)] mb-8 leading-relaxed">
          Connect with friends and start meaningful conversations. Search for
          people you know, send friend requests, and chat in real-time.
        </p>

        <div className="space-y-4">
          <button
            onClick={onShowFriends}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg hover:brightness-95 transition font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
          >
            <UserPlus className="w-5 h-5" />
            Manage Friends
          </button>

          <div className="text-sm text-[var(--color-muted-foreground)]">
            Or select a conversation from the sidebar to start chatting
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <Users className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
            <p className="text-sm font-semibold text-[var(--color-card-foreground)]">
              Add Friends
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              Search and connect
            </p>
          </div>
          <div className="p-4">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <p className="text-sm font-semibold text-[var(--color-card-foreground)]">
              Chat
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              Real-time messaging
            </p>
          </div>
          <div className="p-4">
            <Users className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-sm font-semibold text-[var(--color-card-foreground)]">
              Groups
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              Create group chats
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
