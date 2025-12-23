/**
 * Utility functions for handling video URLs
 */

/**
 * Converts various YouTube URL formats to embed format
 * @param {string} url - The YouTube URL in any format
 * @returns {string} - The embed URL or original URL if not YouTube
 */
export const convertToEmbedUrl = (url) => {
  if (!url) return "";

  // If it's already an embed URL, return as is
  if (url.includes("youtube.com/embed/") || url.includes("youtu.be/embed/")) {
    return url;
  }

  // Extract video ID from various YouTube URL formats
  let videoId = null;

  // Standard YouTube URLs: https://www.youtube.com/watch?v=VIDEO_ID
  const standardMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
  );
  if (standardMatch) {
    videoId = standardMatch[1];
  }

  // YouTube short URLs: https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^&\n?#]+)/);
  if (shortMatch) {
    videoId = shortMatch[1];
  }

  // YouTube mobile URLs: https://m.youtube.com/watch?v=VIDEO_ID
  const mobileMatch = url.match(/m\.youtube\.com\/watch\?v=([^&\n?#]+)/);
  if (mobileMatch) {
    videoId = mobileMatch[1];
  }

  // YouTube playlist URLs: https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID
  const playlistMatch = url.match(/youtube\.com\/watch\?v=([^&\n?#]+)/);
  if (playlistMatch) {
    videoId = playlistMatch[1];
  }

  // If we found a video ID, create embed URL
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // If it's not a YouTube URL or we couldn't extract ID, return original
  return url;
};

/**
 * Validates if a URL is a valid YouTube URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if it's a valid YouTube URL
 */
export const isValidYouTubeUrl = (url) => {
  if (!url) return false;

  const youtubePatterns = [
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/(?:www\.)?youtube\.com\/embed\/[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/m\.youtube\.com\/watch\?v=[\w-]+/,
  ];

  return youtubePatterns.some((pattern) => pattern.test(url));
};

/**
 * Extracts video ID from YouTube URL
 * @param {string} url - The YouTube URL
 * @returns {string|null} - The video ID or null if not found
 */
export const extractYouTubeVideoId = (url) => {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};
