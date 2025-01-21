"use client";

import { useEffect, useState } from "react";
import { fetchProfile, toggleFollow } from "@/utils/api";
import {
  UserCircle,
  MapPin,
  LinkIcon,
  Calendar,
  Edit,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProfileData {
  name: string;
  username: string;
  bio: string;
  follower_count: number;
  following_count: number;
  profile_image: string;
  post_count: number;
  location?: string;
  website?: string;
  joined?: string;
  is_our_profile: boolean;
  following: boolean;
}

interface UserProfileProps {
  username: string;
}

export function UserProfile({ username }: UserProfileProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchProfile(username);
        setProfile(data.data);
        setIsFollowing(data.data.following);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [username]);

  if (isLoading) {
    return <div className="text-center">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center">No profile data available</div>;
  }

  const handleToggleFollow = async () => {
    if (!profile) return;

    try {
      // Toggle the follow status on the server
      const newFollowStatus = await toggleFollow(username);

      // Update the profile state
      setProfile((prev) => {
        if (!prev) return null;
        console.log("newFollowStatus.success ===== ", newFollowStatus.success);
        const newFollowerCount =
          newFollowStatus.success == true
            ? prev.follower_count + 1
            : prev.follower_count - 1;

        return {
          ...prev,
          follower_count: newFollowerCount,
          following: newFollowStatus,
        };
      });

      // Update the isFollowing state
      setIsFollowing(newFollowStatus.success);
    } catch (err) {
      console.error("Failed to toggle follow status", err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      {/* Cover Section with Infinity Loop Gradient Animation */}
      <div className="relative h-48 animate-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-[length:200%_200%]">
        {profile?.profile_image ? (
          <img
            src={`http://127.0.0.1:8000/api${profile.profile_image}`}
            alt={profile.username}
            className="absolute bottom-0 left-6 -mb-12 h-32 w-32 rounded-full border-4 border-white object-cover"
          />
        ) : (
          <UserCircle className="text-gray-300 absolute bottom-0 left-6 -mb-12 h-32 w-32 rounded-full border-4 border-white object-cover" />
        )}
      </div>
      <div className="pt-16 px-6 pb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-gray-500 dark:text-gray-100">@{profile.username}</p>
          </div>

          {profile.is_our_profile ? (
            <Link href={"/edit-profile"}>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          ) : (
            <Button
              variant={isFollowing ? "outline" : "default"}
              className="flex items-center gap-2"
              onClick={handleToggleFollow}
            >
              {isFollowing ? (
                <>
                  <UserMinus className="h-4 w-4" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>
        <p className="text-gray-700 mb-4 dark:text-gray-100">{profile.bio}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {profile.location || "surat"}
            </span>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-blue-500"
            >
              <LinkIcon className="h-4 w-4" />
              {profile.website}
            </a>
          )}
          {profile.joined && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {profile.joined}
            </span>
          )}
        </div>
        <div className="flex gap-4 text-sm">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {profile.post_count}{" "}
            <span className="font-normal text-gray-500 dark:text-gray-400">
              Posts
            </span>
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {profile.follower_count}{" "}
            <span className="font-normal text-gray-500 dark:text-gray-400">
              Followers
            </span>
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {profile.following_count}{" "}
            <span className="font-normal text-gray-500 dark:text-gray-400">
              Following
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}