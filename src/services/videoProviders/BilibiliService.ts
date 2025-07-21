import { VideoData, VideoService } from './VideoService.js';

export class BilibiliService implements VideoService {
  async search(query: string): Promise<VideoData[]> {
    // TODO: Implement Bilibili search
    console.log(`Searching Bilibili for: ${query}`);
    return [];
  }

  async getTranscription(videoId: string): Promise<{ text: string; tracks?: any[] }> {
    // TODO: Implement Bilibili transcription
    console.log(`Getting Bilibili transcription for: ${videoId}`);
    return { text: 'Transcription not available for Bilibili yet.' };
  }
}
