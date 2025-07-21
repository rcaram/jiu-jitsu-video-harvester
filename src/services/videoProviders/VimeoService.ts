import { VideoData, VideoService } from './VideoService.js';

export class VimeoService implements VideoService {
  async search(query: string): Promise<VideoData[]> {
    // TODO: Implement Vimeo search
    console.log(`Searching Vimeo for: ${query}`);
    return [];
  }

  async getTranscription(videoId: string): Promise<{ text: string; tracks?: any[] }> {
    // TODO: Implement Vimeo transcription
    console.log(`Getting Vimeo transcription for: ${videoId}`);
    return { text: 'Transcription not available for Vimeo yet.' };
  }
}
