"use client";

import { useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { Sidebar } from "./sidebar";
import { ChatWindow } from "./chat-window";
import { FriendsPage } from "../friends/friends-page";
import { WelcomeScreen } from "./welcome-screen";

interface ChatLayoutProps {
  currentUser: Doc<"users">;
}

export function ChatLayout({ currentUser }: ChatLayoutProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"chat" | "friends">("chat");

  const handleStartChat = (groupId: string) => {
    // Select the created DM and switch to chat view
    setSelectedGroupId(groupId);
    setCurrentView("chat");
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setCurrentView("chat");
  };

  return (
    <div className="flex h-screen bg-[var(--color-muted)]">
      {/* Sidebar - always visible */}
      <Sidebar
        currentUser={currentUser}
        selectedGroupId={selectedGroupId}
        onSelectGroup={handleSelectGroup}
        onShowFriends={() => setCurrentView("friends")}
        currentView={currentView}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {currentView === "friends" ? (
          <FriendsPage
            currentUser={currentUser}
            onStartChat={handleStartChat}
            onBack={() => setCurrentView("chat")}
          />
        ) : selectedGroupId ? (
          <ChatWindow groupId={selectedGroupId} currentUser={currentUser} />
        ) : (
          <WelcomeScreen onShowFriends={() => setCurrentView("friends")} />
        )}
      </div>
    </div>
  );
}
