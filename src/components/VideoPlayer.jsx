"use client";

import { useState, useEffect } from "react";
import { Play, AlertCircle } from "lucide-react";
import { getVideoEmbedInfo } from "@/lib/video-utils";

export default function VideoPlayer({
  videoUrl,
  title,
  className = "",
  onEnded = null,
}) {
  const [videoInfo, setVideoInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoUrl) {
      const info = getVideoEmbedInfo(videoUrl);
      if (info) {
        setVideoInfo(info);
        setError(null);
      } else {
        setError("Unsupported video URL format");
        setVideoInfo(null);
      }
    } else {
      setVideoInfo(null);
      setError(null);
    }
  }, [videoUrl]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  if (error) {
    return (
      <div
        className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-1">Please check the video URL</p>
        </div>
      </div>
    );
  }

  if (!videoInfo) {
    return (
      <div
        className={`bg-gray-900 flex items-center justify-center ${className}`}
      >
        <div className="text-center text-white">
          <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No video available for this lesson</p>
        </div>
      </div>
    );
  }

  // Google Drive Player
  if (videoInfo.type === "googledrive") {
    return (
      <div className={`relative ${className}`}>
        <iframe
          src={videoInfo.embedUrl}
          title={title || "Google Drive Video"}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsPlaying(true)}
        />
      </div>
    );
  }

  // YouTube Player
  if (videoInfo.type === "youtube") {
    return (
      <div className={`relative ${className}`}>
        {!isPlaying && videoInfo.thumbnailUrl ? (
          <div className="relative cursor-pointer group" onClick={handlePlay}>
            <img
              src={videoInfo.thumbnailUrl}
              alt={title || "Video thumbnail"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                setIsPlaying(true);
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-20 transition-all">
              <div className="bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-white ml-1" fill="white" />
              </div>
            </div>
          </div>
        ) : (
          <iframe
            src={`${videoInfo.embedUrl}${isPlaying ? "&autoplay=1" : ""}`}
            title={title || "Video player"}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => setIsPlaying(true)}
          />
        )}
      </div>
    );
  }

  // Vimeo Player
  if (videoInfo.type === "vimeo") {
    return (
      <div className={`relative ${className}`}>
        <iframe
          src={`${videoInfo.embedUrl}${isPlaying ? "&autoplay=1" : ""}`}
          title={title || "Video player"}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsPlaying(true)}
        />
      </div>
    );
  }

  // Direct Video File
  if (videoInfo.type === "direct") {
    return (
      <div className={`relative ${className}`}>
        <video
          className="w-full h-full"
          controls
          preload="metadata"
          onEnded={onEnded}
        >
          <source src={videoInfo.url} type="video/mp4" />
          <source src={videoInfo.url} type="video/webm" />
          <source src={videoInfo.url} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-900 flex items-center justify-center ${className}`}
    >
      <div className="text-center text-white">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Unable to load video</p>
      </div>
    </div>
  );
}
