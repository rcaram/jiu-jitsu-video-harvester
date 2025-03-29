
import { toast } from "sonner";

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
}

// Mock YouTube API data for now
export const searchVideos = async (query: string): Promise<VideoData[]> => {
  try {
    // In a real app, we would call the YouTube API here
    // For demo purposes, let's generate mock data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock BJJ video results based on search query
    const results: VideoData[] = [
      {
        id: "bjj123",
        title: `${query} Fundamentals for Beginners`,
        description: "Learn the essential techniques that every BJJ practitioner should know.",
        thumbnail: "https://i.ytimg.com/vi/sample1/maxresdefault.jpg",
        publishedAt: "2023-06-15T14:30:00Z",
        viewCount: "245,678",
        channelTitle: "BJJ Fanatics",
        link: "https://youtube.com/watch?v=bjj123"
      },
      {
        id: "bjj456",
        title: `Advanced ${query} Techniques`,
        description: "Take your skills to the next level with these advanced techniques.",
        thumbnail: "https://i.ytimg.com/vi/sample2/maxresdefault.jpg",
        publishedAt: "2023-08-22T10:15:00Z",
        viewCount: "123,456",
        channelTitle: "GracieBJJ",
        link: "https://youtube.com/watch?v=bjj456"
      },
      {
        id: "bjj789",
        title: `${query} Competition Highlights 2023`,
        description: "Watch the best moments from this year's competitions.",
        thumbnail: "https://i.ytimg.com/vi/sample3/maxresdefault.jpg",
        publishedAt: "2023-11-05T17:45:00Z",
        viewCount: "89,012",
        channelTitle: "IBJJF Official",
        link: "https://youtube.com/watch?v=bjj789"
      }
    ];
    
    return results;
  } catch (error) {
    console.error("Error searching videos:", error);
    toast.error("Failed to search videos. Please try again.");
    return [];
  }
};

export const getTranscription = async (videoId: string): Promise<string> => {
  // Simulate API call to get transcription
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return "This is a sample transcription for the requested video. In a real app, this would be fetched from YouTube's API or a transcription service. For Brazilian Jiu-Jitsu videos, this transcription would contain detailed explanations of techniques, positions, and strategies.";
};

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
