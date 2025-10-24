import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update user from Clerk authentication
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    profileImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        username: args.username,
        email: args.email,
        profileImageUrl: args.profileImageUrl,
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      username: args.username,
      email: args.email,
      profileImageUrl: args.profileImageUrl,
      createdAt: Date.now(),
    });

    return userId;
  },
});

// Get current user by Clerk ID
export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    return user;
  },
});

// Search for users by username or email
export const searchUsers = query({
  args: {
    searchTerm: v.string(),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm || args.searchTerm.length < 2) {
      return [];
    }

    const searchLower = args.searchTerm.toLowerCase();

    // Get all users and filter in memory (Convex doesn't have LIKE queries)
    const allUsers = await ctx.db.query("users").collect();

    const filteredUsers = allUsers
      .filter((user) => {
        // Don't include current user in search results
        if (user._id === args.currentUserId) return false;

        return (
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      })
      .slice(0, 20); // Limit to 20 results

    return filteredUsers;
  },
});

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get multiple users by IDs
export const getUsersByIds = query({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, args) => {
    const users = await Promise.all(args.userIds.map((id) => ctx.db.get(id)));
    return users.filter((user) => user !== null);
  },
});
