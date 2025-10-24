import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new group chat
export const createGroup = mutation({
  args: {
    name: v.string(),
    createdBy: v.id("users"),
    memberIds: v.array(v.id("users")),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create the group
    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      isDirectMessage: false,
      createdBy: args.createdBy,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
    });

    // Add creator to members if not already included
    const uniqueMemberIds = Array.from(
      new Set([args.createdBy, ...args.memberIds])
    );

    // Add all members to the group
    await Promise.all(
      uniqueMemberIds.map((memberId) =>
        ctx.db.insert("groupMembers", {
          groupId,
          userId: memberId,
          joinedAt: Date.now(),
        })
      )
    );

    return groupId;
  },
});

// Create a direct message (1-on-1 chat)
export const createDirectMessage = mutation({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if a DM already exists between these users
    const existingGroups = await ctx.db
      .query("groups")
      .filter((q) => q.eq(q.field("isDirectMessage"), true))
      .collect();

    for (const group of existingGroups) {
      const members = await ctx.db
        .query("groupMembers")
        .withIndex("by_group_id", (q) => q.eq("groupId", group._id))
        .collect();

      const memberIds = members.map((m) => m.userId);

      if (
        memberIds.length === 2 &&
        memberIds.includes(args.userId1) &&
        memberIds.includes(args.userId2)
      ) {
        return group._id; // Return existing DM
      }
    }

    // Create new DM
    const groupId = await ctx.db.insert("groups", {
      name: "Direct Message",
      isDirectMessage: true,
      createdBy: args.userId1,
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
    });

    // Add both users as members
    await Promise.all([
      ctx.db.insert("groupMembers", {
        groupId,
        userId: args.userId1,
        joinedAt: Date.now(),
      }),
      ctx.db.insert("groupMembers", {
        groupId,
        userId: args.userId2,
        joinedAt: Date.now(),
      }),
    ]);

    return groupId;
  },
});

// Get all groups for a user
export const getUserGroups = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get all group memberships for the user
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    // Get group details
    const groups = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        if (!group) return null;

        // Get all members of this group
        const allMembers = await ctx.db
          .query("groupMembers")
          .withIndex("by_group_id", (q) => q.eq("groupId", group._id))
          .collect();

        const memberDetails = await Promise.all(
          allMembers.map((m) => ctx.db.get(m.userId))
        );

        // For DMs, get the other user's name
        let displayName = group.name;
        if (group.isDirectMessage) {
          const otherUser = memberDetails.find((m) => m?._id !== args.userId);
          displayName = otherUser?.username || "Unknown User";
        }

        return {
          ...group,
          displayName,
          members: memberDetails.filter((m) => m !== null),
        };
      })
    );

    // Filter out null values and sort by last message time
    return groups
      .filter((g) => g !== null)
      .sort((a, b) => (b!.lastMessageAt || 0) - (a!.lastMessageAt || 0));
  },
});

// Get group details
export const getGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) return null;

    // Get all members
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_id", (q) => q.eq("groupId", args.groupId))
      .collect();

    const members = await Promise.all(
      memberships.map((m) => ctx.db.get(m.userId))
    );

    return {
      ...group,
      members: members.filter((m) => m !== null),
    };
  },
});

// Add member to group
export const addMemberToGroup = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (existingMembership) {
      throw new Error("User is already a member");
    }

    await ctx.db.insert("groupMembers", {
      groupId: args.groupId,
      userId: args.userId,
      joinedAt: Date.now(),
    });
  },
});

// Remove member from group
export const removeMemberFromGroup = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member");
    }

    await ctx.db.delete(membership._id);
  },
});
