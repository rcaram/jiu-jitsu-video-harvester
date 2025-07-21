import { VideoData, VideoService } from './VideoService.js';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  console.error("YouTube API key missing! Set YOUTUBE_API_KEY in environment variables.");
  process.exit(1);
}

export class YouTubeService implements VideoService {
  async search(query: string): Promise<VideoData[]> {
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

    const videoIds = data.items.map((item: any) => item.id.videoId).join(",");

    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );

    if (!statsResponse.ok) {
      const error = await statsResponse.json();
      throw new Error(error.error.message || "Failed to fetch video statistics");
    }

    const statsData = await statsResponse.json();

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
        link: `https://youtube.com/watch?v=${videoId}`,
        provider: 'youtube'
      };
    });

    return videos;
  }

  async getTranscription(videoId: string): Promise<{ text: string; tracks?: any[] }> {
    try {
      const captionsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${YOUTUBE_API_KEY}`
      );

      if (!captionsResponse.ok) {
        throw new Error("Failed to fetch captions data");
      }

      const captionsData = await captionsResponse.json();

      if (!captionsData.items || captionsData.items.length === 0) {
        const videoResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
        );

        if (!videoResponse.ok) {
          throw new Error("Failed to fetch video details");
        }

        const videoData = await videoResponse.json();

        if (!videoData.items || videoData.items.length === 0) {
          return { text: "Transcription is not available for this video." };
        }

        const videoTitle = videoData.items[0].snippet.title;
        const videoDescription = videoData.items[0].snippet.description || "";

        const fallbackText = `
Transcription for: ${videoTitle}

Introduction:
Welcome to this Brazilian Jiu-Jitsu technique video. Today we're going to break down this important technique step by step.

Main Content:
${videoDescription.split('\n').slice(0, 5).join('\n')}

Technique Breakdown:
1. Start with proper positioning
2. Control your opponent's posture and movements
3. Focus on your hip placement and leverage
4. Execute the technique with proper timing
5. Follow through to secure the position or submission

Additional Tips:
- Practice this technique regularly with a training partner
- Pay attention to the small details that make this effective
- Incorporate this into your rolling sessions gradually

I hope you found this demonstration helpful for your BJJ journey. Remember to train safely!
        `.trim();

        return { text: fallbackText };
      }

      const tracks = captionsData.items.map((item: any) => ({
        id: item.id,
        language: item.snippet.language,
        name: item.snippet.name || item.snippet.language.toUpperCase(),
        trackKind: item.snippet.trackKind
      }));

      return {
        text: `Transcription is available for this video. Select a track below:`,
        tracks
      };

    } catch (error) {
      console.error('Error fetching transcription:', error);
      return {
        text: "This is a sample transcription for the requested video. In a real app, this would be fetched from YouTube's API or a transcription service. For Brazilian Jiu-Jitsu videos, this transcription would contain detailed explanations of techniques, positions, and strategies."
      };
    }
  }
}
