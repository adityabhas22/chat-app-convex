"use client";

import { useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { Sidebar } from "./sidebar";
import { ChatWindow } from "./chat-window";
import { UserSearch } from "./user-search";

interface ChatLayoutProps {
  currentUser: Doc<"users">;
}

export function ChatLayout({ currentUser }: ChatLayoutProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        selectedGroupId={selectedGroupId}
        onSelectGroup={setSelectedGroupId}
        onShowSearch={() => setShowSearch(true)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedGroupId ? (
          <ChatWindow groupId={selectedGroupId} currentUser={currentUser} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-xl mb-2">Welcome to Chat App</p>
              <p className="text-sm">
                Select a conversation or start a new one
              </p>
            </div>
          </div>
        )}
      </div>

      {/* User Search Modal */}
      {showSearch && (
        <UserSearch
          currentUser={currentUser}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
}
