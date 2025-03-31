
import { toast } from "sonner";
import { fetchVideos, fetchTranscription } from "@/api/videoApi";

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

// Local storage functions for saved videos
const STORAGE_KEY = 'bjj_saved_videos';

export const getSavedVideos = (): VideoData[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const saveVideo = (video: VideoData): void => {
  const savedVideos = getSavedVideos();
  const exists = savedVideos.some(v => v.id === video.id);
  
  if (!exists) {
    const updatedVideos = [...savedVideos, { ...video, saved: true }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVideos));
    toast.success("Video saved successfully!");
  } else {
    toast.info("This video is already saved.");
  }
};

export const removeVideo = (videoId: string): void => {
  const savedVideos = getSavedVideos();
  const updatedVideos = savedVideos.filter(v => v.id !== videoId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVideos));
  toast.success("Video removed from saved list.");
};

export const videoExists = (videoId: string): boolean => {
  const savedVideos = getSavedVideos();
  return savedVideos.some(v => v.id === videoId);
};

export const getVideoById = (videoId: string): VideoData | undefined => {
  const savedVideos = getSavedVideos();
  return savedVideos.find(v => v.id === videoId);
};
