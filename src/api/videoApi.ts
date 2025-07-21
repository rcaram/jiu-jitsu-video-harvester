
import { toast } from "sonner";
import { VideoData, CaptionTrack } from "@/services/videoService";

const API_BASE_URL = "/api";

export const fetchVideos = async (query: string, provider: 'youtube' | 'vimeo' | 'bilibili'): Promise<VideoData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/search?q=${encodeURIComponent(query)}&provider=${provider}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to search videos");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching videos:", error);
    toast.error("Failed to search videos. Please try again.");
    return [];
  }
};

export const fetchTranscription = async (videoId: string, provider: 'youtube' | 'vimeo' | 'bilibili'): Promise<{text: string; tracks?: CaptionTrack[]}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/${provider}/${videoId}/transcription`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch transcription");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching transcription:", error);
    return { text: "Failed to load transcription. Please try again." };
  }
};

export const fetchSavedVideos = async (userId: string): Promise<VideoData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/videos`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch saved videos");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching saved videos:", error);
    toast.error("Failed to fetch saved videos. Please try again.");
    return [];
  }
};

export const saveVideoToServer = async (userId: string, video: VideoData): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(video),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save video");
    }
    
    return true;
  } catch (error) {
    console.error("Error saving video:", error);
    toast.error("Failed to save video. Please try again.");
    return false;
  }
};

export const removeVideoFromServer = async (userId: string, videoId: string, provider: 'youtube' | 'vimeo' | 'bilibili'): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/videos/${provider}/${videoId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to remove video");
    }
    
    return true;
  } catch (error) {
    console.error("Error removing video:", error);
    toast.error("Failed to remove video. Please try again.");
    return false;
  }
};

export const checkVideoExists = async (userId: string, videoId: string, provider: 'youtube' | 'vimeo' | 'bilibili'): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/videos/${provider}/${videoId}/exists`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to check if video exists");
    }
    
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error("Error checking if video exists:", error);
    return false;
  }
};
