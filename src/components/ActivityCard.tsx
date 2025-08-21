"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Heart,
  MessageCircle,
  Users,
  MapPin,
  Calendar,
  Flag,
  CheckCircle,
} from "lucide-react";
import {
  formatDateTime,
  getFrequencyLabel,
  getGenreLabel,
  getTypeLabel,
} from "@/lib/utils";

interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  genre: string;
  location?: string;
  startDate?: string;
  frequency: string;
  capacity?: number;
  likeCount: number;
  commentCount: number;
  joinedCount: number;
  author: {
    id: string;
    name: string;
    rollNumber: string;
    isVerified: boolean;
  };
  createdAt: string;
}

interface ActivityCardProps {
  activity: Activity;
  onLike: () => void;
  onJoin: () => void;
  onReport: () => void;
}

export default function ActivityCard({
  activity,
  onLike,
  onJoin,
  onReport,
}: ActivityCardProps) {
  const [liked, setLiked] = useState(false);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/activities/${activity.id}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        onLike();
      }
    } catch (error) {
      console.error("Failed to like activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/activities/${activity.id}/join`, {
        method: "POST",
      });

      if (response.ok) {
        setJoined(true);
        onJoin();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to join activity");
      }
    } catch (error) {
      console.error("Failed to join activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    const reason = prompt(
      "Please provide a reason for reporting this activity:"
    );
    if (!reason || reason.trim().length < 10) {
      alert("Please provide a valid reason (at least 10 characters)");
      return;
    }

    try {
      const response = await fetch(`/api/activities/${activity.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (response.ok) {
        alert("Report submitted successfully");
        onReport();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to submit report");
      }
    } catch (error) {
      console.error("Failed to report activity:", error);
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {activity.author.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg leading-tight mb-2">
                <Link
                  href={`/activity/${activity.id}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent hover:from-blue-600 hover:to-purple-600"
                >
                  {activity.title}
                </Link>
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {activity.author.name}
                </span>
                {activity.author.isVerified && (
                  <div className="relative">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                )}
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.author.rollNumber}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                activity.type === "OPEN"
                  ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                  : activity.type === "COMMUNITY"
                  ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
                  : "bg-gradient-to-r from-purple-400 to-pink-500 text-white"
              }`}
            >
              {getTypeLabel(activity.type)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDateTime(activity.createdAt)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-3">
        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
          {activity.description}
        </p>

        <div className="space-y-2 text-sm text-gray-500">
          {activity.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{activity.location}</span>
            </div>
          )}

          {activity.startDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDateTime(activity.startDate)}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <span className="font-medium">Frequency:</span>
            <span>{getFrequencyLabel(activity.frequency)}</span>
          </div>

          {activity.capacity && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {activity.joinedCount}/{activity.capacity} joined
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                liked
                  ? "text-red-500"
                  : "text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              }`}
            >
              <Heart
                className={`h-5 w-5 ${
                  liked ? "fill-current animate-pulse" : ""
                }`}
              />
              <span className="font-semibold">{activity.likeCount}</span>
            </button>

            <Link
              href={`/activity/${activity.id}`}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">{activity.commentCount}</span>
            </Link>

            <span className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <Users className="h-5 w-5" />
              <span className="font-semibold">{activity.joinedCount}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleJoin}
              disabled={loading || joined}
              className={`font-semibold px-6 py-2 rounded-full transition-all duration-200 hover:scale-105 shadow-md ${
                joined
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              }`}
            >
              {loading ? "..." : joined ? "✓ Joined" : "Join"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReport}
              className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-all duration-200 hover:scale-105"
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
