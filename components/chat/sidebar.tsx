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
  onShowSearch: () => void;
}

export function Sidebar({
  currentUser,
  selectedGroupId,
  onSelectGroup,
  onShowSearch,
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
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">Chat App</h1>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={onShowSearch}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-sm">Add Friend</span>
            </button>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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
              onClick={onShowSearch}
              className="text-xs text-blue-600 hover:underline"
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
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Add friends to start chatting!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => onSelectGroup(group._id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                    selectedGroupId === group._id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                      {group.isDirectMessage
                        ? group.displayName.charAt(0).toUpperCase()
                        : group.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {group.isDirectMessage ? group.displayName : group.name}
                      </p>
                      <p className="text-xs text-gray-500">
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
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-semibold">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                {currentUser.username}
              </p>
              <p className="text-xs text-gray-500 truncate">
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
