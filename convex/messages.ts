import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a message to a group
export const sendMessage = mutation({
  args: {
    groupId: v.id("groups"),
    senderId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify user is a member of the group
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.senderId)
      )
      .first();

    if (!membership) {
      throw new Error("You are not a member of this group");
    }

    // Create the message
    const messageId = await ctx.db.insert("messages", {
      groupId: args.groupId,
      senderId: args.senderId,
      content: args.content,
      createdAt: Date.now(),
    });

    // Update group's lastMessageAt
    await ctx.db.patch(args.groupId, {
      lastMessageAt: Date.now(),
    });

    return messageId;
  },
});

// Get messages for a group
export const getGroupMessages = query({
  args: {
    groupId: v.id("groups"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    // Get messages sorted by creation time
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_group_and_created", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .take(limit);

    // Get sender details for each message
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          sender,
        };
      })
    );

    // Return in chronological order (oldest first)
    return messagesWithSenders.reverse();
  },
});

// Get recent messages across all groups for a user
export const getRecentMessages = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Get user's groups
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    const groupIds = memberships.map((m) => m.groupId);

    // Get recent messages from all groups
    const allMessages = await Promise.all(
      groupIds.map((groupId) =>
        ctx.db
          .query("messages")
          .withIndex("by_group_id", (q) => q.eq("groupId", groupId))
          .order("desc")
          .take(1)
      )
    );

    // Flatten and sort by time
    const messages = allMessages
      .flat()
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    // Add sender and group details
    const messagesWithDetails = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        const group = await ctx.db.get(message.groupId);
        return {
          ...message,
          sender,
          group,
        };
      })
    );

    return messagesWithDetails;
  },
});

// Delete a message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    // Only the sender can delete their message
    if (message.senderId !== args.userId) {
      throw new Error("You can only delete your own messages");
    }

    await ctx.db.delete(args.messageId);
  },
});
