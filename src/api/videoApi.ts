
import { toast } from "sonner";
import { VideoData, CaptionTrack } from "@/services/videoService";

const API_BASE_URL = "/api";

export const fetchVideos = async (query: string): Promise<VideoData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/search?q=${encodeURIComponent(query)}`);
    
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

export const fetchTranscription = async (videoId: string): Promise<{text: string; tracks?: CaptionTrack[]}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/${videoId}/transcription`);
    
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
