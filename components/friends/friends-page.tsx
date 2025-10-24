"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import {
  Search,
  UserPlus,
  Users,
  MessageSquare,
  Check,
  X,
  Clock,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useToast, ToastContainer } from "../ui/toast";

interface FriendsPageProps {
  currentUser: Doc<"users">;
  onStartChat: (groupId: string) => void;
  onBack: () => void;
}

export function FriendsPage({
  currentUser,
  onStartChat,
  onBack,
}: FriendsPageProps) {
  const [activeTab, setActiveTab] = useState<"friends" | "search" | "requests">(
    "friends"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const toast = useToast();

  // Queries
  const friends = useQuery(api.friendships.getFriends, {
    userId: currentUser._id,
  });

  const pendingRequests = useQuery(api.friendships.getPendingRequests, {
    userId: currentUser._id,
  });

  const sentRequests = useQuery(api.friendships.getSentRequests, {
    userId: currentUser._id,
  });

  const searchResults = useQuery(
    api.users.searchUsers,
    searchTerm.length >= 2
      ? { searchTerm, currentUserId: currentUser._id }
      : "skip"
  );

  // Mutations
  const sendFriendRequest = useMutation(api.friendships.sendFriendRequest);
  const acceptFriendRequest = useMutation(api.friendships.acceptFriendRequest);
  const rejectFriendRequest = useMutation(api.friendships.rejectFriendRequest);
  const createDirectMessage = useMutation(api.groups.createDirectMessage);

  // Helper functions
  const addLoadingAction = (id: string) => {
    setLoadingActions((prev) => new Set([...prev, id]));
  };

  const removeLoadingAction = (id: string) => {
    setLoadingActions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const isLoading = (id: string) => loadingActions.has(id);

  const isFriend = (userId: string) => {
    return friends?.some((f) => f._id === userId);
  };

  const hasPendingRequest = (userId: string) => {
    return sentRequests?.some((r) => r.recipient?._id === userId);
  };

  // Action handlers
  const handleSendFriendRequest = async (friendId: string) => {
    const actionId = `send-${friendId}`;
    addLoadingAction(actionId);

    try {
      await sendFriendRequest({
        userId: currentUser._id,
        friendId: friendId as any,
      });
      toast.success(
        "Friend request sent!",
        "Your request has been sent successfully."
      );
    } catch (error: any) {
      toast.error(
        "Failed to send friend request",
        error.message || "Please try again later."
      );
    } finally {
      removeLoadingAction(actionId);
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    const actionId = `accept-${friendshipId}`;
    addLoadingAction(actionId);

    try {
      await acceptFriendRequest({ friendshipId: friendshipId as any });
      toast.success("Friend request accepted!", "You are now friends.");
    } catch (error) {
      toast.error("Failed to accept friend request", "Please try again later.");
    } finally {
      removeLoadingAction(actionId);
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    const actionId = `reject-${friendshipId}`;
    addLoadingAction(actionId);

    try {
      await rejectFriendRequest({ friendshipId: friendshipId as any });
      toast.info("Friend request declined", "The request has been declined.");
    } catch (error) {
      toast.error(
        "Failed to decline friend request",
        "Please try again later."
      );
    } finally {
      removeLoadingAction(actionId);
    }
  };

  const handleStartChat = async (friendId: string) => {
    const actionId = `chat-${friendId}`;
    addLoadingAction(actionId);

    try {
      const groupId = await createDirectMessage({
        userId1: currentUser._id,
        userId2: friendId as any,
      });
      toast.success("Chat started!", "Opening your conversation...");
      onStartChat(groupId);
    } catch (error) {
      toast.error("Failed to start chat", "Please try again later.");
    } finally {
      removeLoadingAction(actionId);
    }
  };

  const getUserStatus = (userId: string) => {
    if (isFriend(userId)) return "friend";
    if (hasPendingRequest(userId)) return "pending";
    return "none";
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <div className="flex-1 flex flex-col bg-[var(--color-card)]">
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="p-2 hover:bg-[var(--color-muted)] rounded-full transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[var(--color-card-foreground)]">
              Friends
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex-1 py-3 px-4 rounded-lg transition font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] ${
                activeTab === "friends"
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:brightness-95"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                My Friends ({friends?.length || 0})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`flex-1 py-3 px-4 rounded-lg transition font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] ${
                activeTab === "search"
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:brightness-95"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                Find Friends
              </div>
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 py-3 px-4 rounded-lg transition font-medium relative focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] ${
                activeTab === "requests"
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:brightness-95"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Requests
                {pendingRequests && pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-muted)]/40">
          {/* Friends Tab */}
          {activeTab === "friends" && (
            <div className="space-y-4">
              {!friends ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-[var(--color-muted-foreground)] mb-2">
                    No friends yet
                  </h3>
                  <p className="text-[var(--color-muted-foreground)] mb-6">
                    Start by searching for people you know!
                  </p>
                  <button
                    onClick={() => setActiveTab("search")}
                    className="px-6 py-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg hover:brightness-95 transition"
                  >
                    Find Friends
                  </button>
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-muted)] transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--color-card-foreground)]">
                          {friend.username}
                        </h3>
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                          {friend.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartChat(friend._id)}
                      disabled={isLoading(`chat-${friend._id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg hover:brightness-95 disabled:bg-gray-300 transition"
                    >
                      {isLoading(`chat-${friend._id}`) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                      Message
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === "search" && (
            <div className="space-y-6">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by username or email..."
                  className="w-full pl-10 pr-4 py-3 border border-[var(--color-input)] rounded-lg bg-[var(--color-card)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                  autoFocus
                />
              </div>

              {/* Search Results */}
              <div className="space-y-4">
                {searchTerm.length < 2 ? (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">
                      Enter at least 2 characters to search for friends
                    </p>
                  </div>
                ) : !searchResults ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">
                      No users found matching "{searchTerm}"
                    </p>
                  </div>
                ) : (
                  searchResults.map((user) => {
                    const status = getUserStatus(user._id);

                    return (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-muted)] transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[var(--color-card-foreground)]">
                              {user.username}
                            </h3>
                            <p className="text-sm text-[var(--color-muted-foreground)]">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {status === "friend" ? (
                            <>
                              <span className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                <Check className="w-4 h-4" />
                                Friends
                              </span>
                              <button
                                onClick={() => handleStartChat(user._id)}
                                disabled={isLoading(`chat-${user._id}`)}
                                className="flex items-center gap-1 px-3 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg hover:brightness-95 disabled:bg-gray-300 transition"
                              >
                                {isLoading(`chat-${user._id}`) ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <MessageSquare className="w-4 h-4" />
                                )}
                                Chat
                              </button>
                            </>
                          ) : status === "pending" ? (
                            <span className="flex items-center gap-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                              <Clock className="w-4 h-4" />
                              Request Sent
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSendFriendRequest(user._id)}
                              disabled={isLoading(`send-${user._id}`)}
                              className="flex items-center gap-1 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg hover:brightness-95 disabled:bg-gray-300 transition"
                            >
                              {isLoading(`send-${user._id}`) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <UserPlus className="w-4 h-4" />
                              )}
                              Add Friend
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === "requests" && (
            <div className="space-y-6">
              {/* Incoming Requests */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-card-foreground)] mb-4">
                  Incoming Requests ({pendingRequests?.length || 0})
                </h3>
                <div className="space-y-4">
                  {!pendingRequests ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : pendingRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-[var(--color-muted-foreground)]">
                        No pending friend requests
                      </p>
                    </div>
                  ) : (
                    pendingRequests.map((request) => (
                      <div
                        key={request._id}
                        className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-semibold text-lg">
                            {request.requester?.username
                              .charAt(0)
                              .toUpperCase() || "?"}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[var(--color-card-foreground)]">
                              {request.requester?.username || "Unknown User"}
                            </h3>
                            <p className="text-sm text-[var(--color-muted-foreground)]">
                              {request.requester?.email || ""}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request._id)}
                            disabled={isLoading(`accept-${request._id}`)}
                            className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:brightness-95 disabled:bg-gray-300 transition"
                          >
                            {isLoading(`accept-${request._id}`) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request._id)}
                            disabled={isLoading(`reject-${request._id}`)}
                            className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:brightness-95 disabled:bg-gray-300 transition"
                          >
                            {isLoading(`reject-${request._id}`) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sent Requests */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-card-foreground)] mb-4">
                  Sent Requests ({sentRequests?.length || 0})
                </h3>
                <div className="space-y-4">
                  {!sentRequests ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : sentRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-[var(--color-muted-foreground)]">
                        No sent requests
                      </p>
                    </div>
                  ) : (
                    sentRequests.map((request) => (
                      <div
                        key={request._id}
                        className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                            {request.recipient?.username
                              .charAt(0)
                              .toUpperCase() || "?"}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[var(--color-card-foreground)]">
                              {request.recipient?.username || "Unknown User"}
                            </h3>
                            <p className="text-sm text-[var(--color-muted-foreground)]">
                              {request.recipient?.email || ""}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Sent{" "}
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <span className="flex items-center gap-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                          <Clock className="w-4 h-4" />
                          Pending
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
