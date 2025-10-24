import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table with authentication and profile info
  users: defineTable({
    clerkId: v.string(), // Clerk user ID for authentication
    username: v.string(),
    email: v.string(),
    profileImageUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_username", ["username"]),

  // Friendships table for managing friend connections
  friendships: defineTable({
    userId: v.id("users"),
    friendId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    requestedBy: v.id("users"), // Who initiated the friend request
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_friend_id", ["friendId"])
    .index("by_user_and_friend", ["userId", "friendId"]),

  // Groups/Chats table
  groups: defineTable({
    name: v.string(),
    isDirectMessage: v.boolean(), // true for 1-on-1 chats, false for group chats
    createdBy: v.id("users"),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    lastMessageAt: v.optional(v.number()),
  }).index("by_created_at", ["createdAt"]),

  // Group members table (many-to-many relationship)
  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_group_id", ["groupId"])
    .index("by_user_id", ["userId"])
    .index("by_group_and_user", ["groupId", "userId"]),

  // Messages table
  messages: defineTable({
    groupId: v.id("groups"),
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_group_id", ["groupId"])
    .index("by_sender_id", ["senderId"])
    .index("by_group_and_created", ["groupId", "createdAt"]),
});
