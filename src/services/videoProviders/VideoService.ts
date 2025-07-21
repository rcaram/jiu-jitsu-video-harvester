export interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: string;
  channelTitle: string;
  link: string;
  provider: 'youtube' | 'vimeo' | 'bilibili';
}

export interface VideoService {
  search(query: string): Promise<VideoData[]>;
  getTranscription(videoId: string): Promise<{ text: string; tracks?: any[] }>;
}
