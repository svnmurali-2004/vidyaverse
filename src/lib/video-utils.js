/**
 * Video URL utilities for handling YouTube, Vimeo, and direct video URLs
 */

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function getYouTubeVideoId(url) {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Extract Vimeo video ID from Vimeo URL
 */
export function getVimeoVideoId(url) {
  if (!url) return null;

  const pattern = /(?:vimeo\.com\/)(\d+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

/**
 * Determine video type and return appropriate embed info
 */
export function getVideoEmbedInfo(url) {
  if (!url) return null;

  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) {
    return {
      type: "youtube",
      id: youtubeId,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&fs=1&cc_load_policy=1&iv_load_policy=3&showinfo=0&controls=1&autoplay=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
    };
  }

  const vimeoId = getVimeoVideoId(url);
  if (vimeoId) {
    return {
      type: "vimeo",
      id: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?color=ffffff&title=0&byline=0&portrait=0&badge=0`,
      thumbnailUrl: null, // Vimeo thumbnails require API call
    };
  }

  // Check if it's a direct video file
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
  const isDirectVideo = videoExtensions.some((ext) =>
    url.toLowerCase().includes(ext)
  );

  if (isDirectVideo) {
    return {
      type: "direct",
      url: url,
      embedUrl: url,
      thumbnailUrl: null,
    };
  }

  return null;
}

/**
 * Check if URL is a valid video URL
 */
export function isValidVideoUrl(url) {
  return getVideoEmbedInfo(url) !== null;
}
