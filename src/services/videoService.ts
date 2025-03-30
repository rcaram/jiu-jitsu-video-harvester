
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

// YouTube API key - in a real app, this should be stored in environment variables
const YOUTUBE_API_KEY = "YOUR_YOUTUBE_API_KEY"; // Replace with your YouTube API key

export const searchVideos = async (query: string): Promise<VideoData[]> => {
  try {
    // Add BJJ to the search query to focus results
    const searchQuery = `${query} BJJ Brazilian Jiu Jitsu`;
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(
        searchQuery
      )}&type=video&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message || "YouTube API request failed");
    }

    const data = await response.json();
    
    // Get the video IDs to fetch additional details like view count
    const videoIds = data.items.map((item: any) => item.id.videoId).join(",");
    
    // Fetch video statistics
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );

    if (!statsResponse.ok) {
      const error = await statsResponse.json();
      throw new Error(error.error.message || "Failed to fetch video statistics");
    }

    const statsData = await statsResponse.json();
    
    // Map the response to our VideoData interface
    const videos: VideoData[] = data.items.map((item: any) => {
      const videoId = item.id.videoId;
      const stats = statsData.items.find((stat: any) => stat.id === videoId);
      
      return {
        id: videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        publishedAt: item.snippet.publishedAt,
        viewCount: stats ? Number(stats.statistics.viewCount).toLocaleString() : "0",
        channelTitle: item.snippet.channelTitle,
        link: `https://youtube.com/watch?v=${videoId}`
      };
    });
    
    return videos;
  } catch (error) {
    console.error("Error searching videos:", error);
    toast.error("Failed to search videos. Please try again.");
    
    // Fallback to mock data if API call fails
    return getFallbackVideos(query);
  }
};

// Fallback function to return mock data if the API call fails
const getFallbackVideos = (query: string): VideoData[] => {
  console.log("Using fallback data for search:", query);
  return [
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
};

export const getTranscription = async (videoId: string): Promise<string> => {
  // In a real app, you would use a transcription service or YouTube's captions API
  // For now, we'll continue using the mock data
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
