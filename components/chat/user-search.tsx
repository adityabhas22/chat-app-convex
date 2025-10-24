"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { X, Search, UserPlus, Check, Clock, MessageSquare } from "lucide-react";

interface UserSearchProps {
  currentUser: Doc<"users">;
  onClose: () => void;
}

export function UserSearch({ currentUser, onClose }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "requests">("search");

  const searchResults = useQuery(
    api.users.searchUsers,
    searchTerm.length >= 2
      ? { searchTerm, currentUserId: currentUser._id }
      : "skip"
  );

  const pendingRequests = useQuery(api.friendships.getPendingRequests, {
    userId: currentUser._id,
  });

  const friends = useQuery(api.friendships.getFriends, {
    userId: currentUser._id,
  });

  const sendFriendRequest = useMutation(api.friendships.sendFriendRequest);
  const acceptFriendRequest = useMutation(api.friendships.acceptFriendRequest);
  const rejectFriendRequest = useMutation(api.friendships.rejectFriendRequest);
  const createDirectMessage = useMutation(api.groups.createDirectMessage);

  const handleAddFriend = async (friendId: string) => {
    try {
      await sendFriendRequest({
        userId: currentUser._id,
        friendId: friendId as any,
      });
    } catch (error: any) {
      alert(error.message || "Failed to send friend request");
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await acceptFriendRequest({ friendshipId: friendshipId as any });
    } catch (error) {
      alert("Failed to accept friend request");
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    try {
      await rejectFriendRequest({ friendshipId: friendshipId as any });
    } catch (error) {
      alert("Failed to reject friend request");
    }
  };

  const handleStartChat = async (friendId: string) => {
    try {
      await createDirectMessage({
        userId1: currentUser._id,
        userId2: friendId as any,
      });
      onClose();
    } catch (error) {
      alert("Failed to start chat");
    }
  };

  const isFriend = (userId: string) => {
    return friends?.some((f) => f._id === userId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {activeTab === "search" ? "Find Friends" : "Friend Requests"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("search")}
              className={`flex-1 py-2 px-4 rounded-lg transition ${
                activeTab === "search"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Search Users
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 py-2 px-4 rounded-lg transition relative ${
                activeTab === "requests"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Requests
              {pendingRequests && pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "search" ? (
            <>
              {/* Search Input */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by username or email..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Search Results */}
              <div className="space-y-3">
                {searchTerm.length < 2 ? (
                  <p className="text-center text-gray-500 py-8">
                    Enter at least 2 characters to search
                  </p>
                ) : !searchResults ? (
                  <p className="text-center text-gray-500 py-8">Searching...</p>
                ) : searchResults.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No users found
                  </p>
                ) : (
                  searchResults.map((user) => {
                    const isUserFriend = isFriend(user._id);

                    return (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {user.username}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {isUserFriend ? (
                          <div className="flex gap-2">
                            <span className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
                              <Check className="w-4 h-4" />
                              Friends
                            </span>
                            <button
                              onClick={() => handleStartChat(user._id)}
                              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Chat
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddFriend(user._id)}
                            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            <UserPlus className="w-4 h-4" />
                            Add Friend
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {!pendingRequests ? (
                <p className="text-center text-gray-500 py-8">Loading...</p>
              ) : pendingRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No pending friend requests
                </p>
              ) : (
                pendingRequests.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-semibold">
                        {request.requester?.username.charAt(0).toUpperCase() ||
                          "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {request.requester?.username || "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.requester?.email || ""}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
