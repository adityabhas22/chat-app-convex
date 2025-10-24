"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSyncUser } from "@/hooks/use-sync-user";
import { ChatLayout } from "@/components/chat/chat-layout";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  useSyncUser();

  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  if (!isUserLoaded || (user && !currentUser)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading user data...</p>
      </div>
    );
  }

  return <ChatLayout currentUser={currentUser} />;
}
