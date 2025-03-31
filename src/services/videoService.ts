
import { toast } from "sonner";
import { 
  fetchVideos, 
  fetchTranscription, 
  fetchSavedVideos, 
  saveVideoToServer, 
  removeVideoFromServer,
  checkVideoExists
} from "@/api/videoApi";
import { useAuth } from "@clerk/clerk-react";

export interface CaptionTrack {
  id: string;
  language: string;
  name: string;
  trackKind: string;
}

export interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: string;
  channelTitle: string;
  link: string;
  transcription?: string;
  saved?: boolean;
  captionTracks?: CaptionTrack[];
}

// API functions that communicate with our backend
export const searchVideos = fetchVideos;
export const getTranscription = fetchTranscription;

// Storage key for fallback when user is not authenticated
const STORAGE_KEY = 'bjj_saved_videos';

// Get saved videos based on authentication status
export const getSavedVideos = async (userId?: string): Promise<VideoData[]> => {
  if (userId) {
    // Fetch from server for authenticated users
    return await fetchSavedVideos(userId);
  } else {
    // Fallback to localStorage for unauthenticated users
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }
};

// Save video based on authentication status
export const saveVideo = async (video: VideoData, userId?: string): Promise<void> => {
  if (userId) {
    // Save to server for authenticated users
    const success = await saveVideoToServer(userId, video);
    if (success) {
      toast.success("Video saved successfully!");
    }
  } else {
    // Fallback to localStorage for unauthenticated users
    const savedVideos = localStorage.getItem(STORAGE_KEY);
    const videos = savedVideos ? JSON.parse(savedVideos) : [];
    const exists = videos.some((v: VideoData) => v.id === video.id);
    
    if (!exists) {
      const updatedVideos = [...videos, { ...video, saved: true }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVideos));
      toast.success("Video saved successfully!");
    } else {
      toast.info("This video is already saved.");
    }
  }
};

// Remove video based on authentication status
export const removeVideo = async (videoId: string, userId?: string): Promise<void> => {
  if (userId) {
    // Remove from server for authenticated users
    const success = await removeVideoFromServer(userId, videoId);
    if (success) {
      toast.success("Video removed from saved list.");
    }
  } else {
    // Fallback to localStorage for unauthenticated users
    const savedVideos = localStorage.getItem(STORAGE_KEY);
    if (savedVideos) {
      const videos = JSON.parse(savedVideos);
      const updatedVideos = videos.filter((v: VideoData) => v.id !== videoId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVideos));
      toast.success("Video removed from saved list.");
    }
  }
};

// Check if video exists based on authentication status
export const videoExists = async (videoId: string, userId?: string): Promise<boolean> => {
  if (userId) {
    // Check on server for authenticated users
    return await checkVideoExists(userId, videoId);
  } else {
    // Fallback to localStorage for unauthenticated users
    const savedVideos = localStorage.getItem(STORAGE_KEY);
    if (!savedVideos) return false;
    const videos = JSON.parse(savedVideos);
    return videos.some((v: VideoData) => v.id === videoId);
  }
};

// Get a video by ID based on authentication status
export const getVideoById = async (videoId: string, userId?: string): Promise<VideoData | undefined> => {
  if (userId) {
    // Get from server for authenticated users
    const videos = await fetchSavedVideos(userId);
    return videos.find(v => v.id === videoId);
  } else {
    // Fallback to localStorage for unauthenticated users
    const savedVideos = localStorage.getItem(STORAGE_KEY);
    if (!savedVideos) return undefined;
    const videos = JSON.parse(savedVideos);
    return videos.find((v: VideoData) => v.id === videoId);
  }
};

// Custom hook to use video functions with current user
export const useVideo = () => {
  const { userId, isSignedIn } = useAuth();
  const currentUserId = isSignedIn ? userId : undefined;

  return {
    searchVideos,
    getTranscription,
    getSavedVideos: () => getSavedVideos(currentUserId),
    saveVideo: (video: VideoData) => saveVideo(video, currentUserId),
    removeVideo: (videoId: string) => removeVideo(videoId, currentUserId),
    videoExists: (videoId: string) => videoExists(videoId, currentUserId),
    getVideoById: (videoId: string) => getVideoById(videoId, currentUserId),
  };
};
