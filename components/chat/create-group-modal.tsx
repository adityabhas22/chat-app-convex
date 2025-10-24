"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { X, Users } from "lucide-react";

interface CreateGroupModalProps {
  currentUser: Doc<"users">;
  friends: Doc<"users">[];
  onClose: () => void;
}

export function CreateGroupModal({
  currentUser,
  friends,
  onClose,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set()
  );
  const [isCreating, setIsCreating] = useState(false);

  const createGroup = useMutation(api.groups.createGroup);

  const toggleMember = (userId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedMembers(newSelected);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    if (selectedMembers.size === 0) {
      alert("Please select at least one member");
      return;
    }

    setIsCreating(true);

    try {
      await createGroup({
        name: groupName.trim(),
        createdBy: currentUser._id,
        memberIds: Array.from(selectedMembers) as any,
      });
      onClose();
    } catch (error) {
      alert("Failed to create group");
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--color-card-foreground)] flex items-center gap-2">
              <Users className="w-6 h-6" />
              Create Group
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-muted)] rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleCreateGroup}
          className="flex-1 overflow-y-auto p-6"
        >
          {/* Group Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[var(--color-card-foreground)] mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full px-4 py-3 border border-[var(--color-input)] rounded-lg bg-[var(--color-card)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
              autoFocus
              maxLength={50}
            />
          </div>

          {/* Member Selection */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-card-foreground)] mb-2">
              Add Members ({selectedMembers.size} selected)
            </label>

            {friends.length === 0 ? (
              <p className="text-center text-[var(--color-muted-foreground)] py-8">
                No friends to add. Add friends first!
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {friends.map((friend) => (
                  <button
                    key={friend._id}
                    type="button"
                    onClick={() => toggleMember(friend._id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                      selectedMembers.has(friend._id)
                        ? "bg-indigo-50 border-2 border-indigo-600"
                        : "bg-[var(--color-card)] border-2 border-[var(--color-border)] hover:bg-[var(--color-muted)]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-[var(--color-card-foreground)]">
                        {friend.username}
                      </p>
                      <p className="text-sm text-[var(--color-muted-foreground)]">
                        {friend.email}
                      </p>
                    </div>
                    {selectedMembers.has(friend._id) && (
                      <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-[var(--color-input)] text-[var(--color-foreground)] rounded-lg hover:bg-[var(--color-muted)] transition"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isCreating || !groupName.trim() || selectedMembers.size === 0
              }
              className="flex-1 px-4 py-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg hover:brightness-95 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {isCreating ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
