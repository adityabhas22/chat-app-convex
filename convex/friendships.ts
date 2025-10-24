import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a friend request
export const sendFriendRequest = mutation({
  args: {
    userId: v.id("users"),
    friendId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if friendship already exists (in either direction)
    const existingFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_user_and_friend", (q) =>
        q.eq("userId", args.userId).eq("friendId", args.friendId)
      )
      .first();

    if (existingFriendship) {
      throw new Error("Friend request already exists");
    }

    // Check reverse direction
    const reverseFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_user_and_friend", (q) =>
        q.eq("userId", args.friendId).eq("friendId", args.userId)
      )
      .first();

    if (reverseFriendship) {
      throw new Error("Friend request already exists");
    }

    // Create friendship request
    const friendshipId = await ctx.db.insert("friendships", {
      userId: args.userId,
      friendId: args.friendId,
      status: "pending",
      requestedBy: args.userId,
      createdAt: Date.now(),
    });

    return friendshipId;
  },
});

// Accept a friend request
export const acceptFriendRequest = mutation({
  args: {
    friendshipId: v.id("friendships"),
  },
  handler: async (ctx, args) => {
    const friendship = await ctx.db.get(args.friendshipId);

    if (!friendship) {
      throw new Error("Friend request not found");
    }

    if (friendship.status !== "pending") {
      throw new Error("Friend request is not pending");
    }

    await ctx.db.patch(args.friendshipId, {
      status: "accepted",
    });

    return args.friendshipId;
  },
});

// Reject a friend request
export const rejectFriendRequest = mutation({
  args: {
    friendshipId: v.id("friendships"),
  },
  handler: async (ctx, args) => {
    const friendship = await ctx.db.get(args.friendshipId);

    if (!friendship) {
      throw new Error("Friend request not found");
    }

    await ctx.db.patch(args.friendshipId, {
      status: "rejected",
    });

    return args.friendshipId;
  },
});

// Get all friends for a user
export const getFriends = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get friendships where user is either userId or friendId and status is accepted
    const friendshipsAsUser = await ctx.db
      .query("friendships")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const friendshipsAsFriend = await ctx.db
      .query("friendships")
      .withIndex("by_friend_id", (q) => q.eq("friendId", args.userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    // Get unique friend IDs
    const friendIds = [
      ...friendshipsAsUser.map((f) => f.friendId),
      ...friendshipsAsFriend.map((f) => f.userId),
    ];

    // Fetch friend details
    const friends = await Promise.all(friendIds.map((id) => ctx.db.get(id)));

    return friends.filter((friend) => friend !== null);
  },
});

// Get pending friend requests received by a user
export const getPendingRequests = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get requests where user is the friendId and status is pending
    const requests = await ctx.db
      .query("friendships")
      .withIndex("by_friend_id", (q) => q.eq("friendId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Get requester details
    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.userId);
        return {
          ...request,
          requester,
        };
      })
    );

    return requestsWithUsers;
  },
});

// Get pending friend requests sent by a user
export const getSentRequests = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("friendships")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Get recipient details
    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const recipient = await ctx.db.get(request.friendId);
        return {
          ...request,
          recipient,
        };
      })
    );

    return requestsWithUsers;
  },
});
