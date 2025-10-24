"use client";

import { UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { MessageSquare, UserPlus, Users, Loader2 } from "lucide-react";
import { useState } from "react";
import { CreateGroupModal } from "./create-group-modal";

interface SidebarProps {
  currentUser: Doc<"users">;
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onShowFriends: () => void;
  currentView: "chat" | "friends";
}

export function Sidebar({
  currentUser,
  selectedGroupId,
  onSelectGroup,
  onShowFriends,
  currentView,
}: SidebarProps) {
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const groups = useQuery(api.groups.getUserGroups, {
    userId: currentUser._id,
  });

  const friends = useQuery(api.friendships.getFriends, {
    userId: currentUser._id,
  });

  const pendingRequests = useQuery(api.friendships.getPendingRequests, {
    userId: currentUser._id,
  });

  return (
    <>
      <div className="w-80 bg-[var(--color-card)] border-r border-[var(--color-border)] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-[var(--color-card-foreground)]">
              Chat App
            </h1>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={onShowFriends}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] ${
                currentView === "friends"
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:brightness-95"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-sm">Friends</span>
            </button>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--color-secondary)] text-[var(--color-primary-foreground)] rounded-lg hover:brightness-95 transition focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm">New Group</span>
            </button>
          </div>
        </div>

        {/* Pending Friend Requests */}
        {pendingRequests && pendingRequests.length > 0 && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <p className="text-sm font-semibold text-yellow-800 mb-2">
              Friend Requests ({pendingRequests.length})
            </p>
            <button
              onClick={onShowFriends}
              className="text-xs text-[var(--color-primary)] hover:underline"
            >
              View requests
            </button>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {!groups ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : groups.length === 0 ? (
            <div className="p-8 text-center text-[var(--color-muted-foreground)]">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Add friends to start chatting!</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => onSelectGroup(group._id)}
                  className={`w-full p-4 text-left hover:bg-[var(--color-muted)] transition ${
                    selectedGroupId === group._id
                      ? "bg-indigo-50 dark:bg-indigo-950/20"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {group.isDirectMessage
                        ? group.displayName.charAt(0).toUpperCase()
                        : group.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--color-card-foreground)] truncate">
                        {group.isDirectMessage ? group.displayName : group.name}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">
                        {group.members.length} member
                        {group.members.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Info Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-muted)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--color-card-foreground)] truncate">
                {currentUser.username}
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)] truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal
          currentUser={currentUser}
          friends={friends || []}
          onClose={() => setShowCreateGroup(false)}
        />
      )}
    </>
  );
}
