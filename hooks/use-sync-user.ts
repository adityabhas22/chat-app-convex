"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useSyncUser() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const sync = async () => {
      try {
        await syncUser({
          clerkId: user.id,
          username: user.username || user.firstName || "Anonymous",
          email: user.emailAddresses[0]?.emailAddress || "",
          profileImageUrl: user.imageUrl,
        });
      } catch (error) {
        console.error("Failed to sync user:", error);
      }
    };

    sync();
  }, [user, isLoaded, syncUser]);
}
