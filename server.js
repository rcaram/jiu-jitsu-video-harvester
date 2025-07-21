import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';

// Import video services
import { YouTubeService } from './src/services/videoProviders/YouTubeService.js';
import { BilibiliService } from './src/services/videoProviders/BilibiliService.js';
import { VimeoService } from './src/services/videoProviders/VimeoService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Video services mapping
const videoServices = {
  youtube: new YouTubeService(),
  bilibili: new BilibiliService(),
  vimeo: new VimeoService(),
};

// Database path
const DB_PATH = path.join(__dirname, 'db');
const USERS_PATH = path.join(DB_PATH, 'users');

// Create database directories if they don't exist
const initDatabase = async () => {
  try {
    await fs.mkdir(DB_PATH, { recursive: true });
    await fs.mkdir(USERS_PATH, { recursive: true });
    console.log('Database directories created successfully');
  } catch (error) {
    console.error('Error creating database directories:', error);
  }
};

initDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Get user's directory path
const getUserDir = (userId) => path.join(USERS_PATH, userId);

// Get user's videos file path
const getUserVideosPath = (userId) => path.join(getUserDir(userId), 'videos.json');

// Create user directory if it doesn't exist
const createUserDirIfNotExists = async (userId) => {
  const userDir = getUserDir(userId);
  try {
    await fs.mkdir(userDir, { recursive: true });
  } catch (error) {
    console.error(`Error creating directory for user ${userId}:`, error);
    throw error;
  }
};

// Get user's saved videos
const getUserVideos = async (userId) => {
  const videosPath = getUserVideosPath(userId);
  try {
    const data = await fs.readFile(videosPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    console.error(`Error reading videos for user ${userId}:`, error);
    throw error;
  }
};

// Save user's videos
const saveUserVideos = async (userId, videos) => {
  await createUserDirIfNotExists(userId);
  const videosPath = getUserVideosPath(userId);
  try {
    await fs.writeFile(videosPath, JSON.stringify(videos, null, 2));
  } catch (error) {
    console.error(`Error saving videos for user ${userId}:`, error);
    throw error;
  }
};

// API endpoints for videos
app.get('/api/videos/search', async (req, res) => {
  try {
    const { q: query, provider = 'youtube' } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const videoService = videoServices[provider];
    if (!videoService) {
      return res.status(400).json({ message: 'Invalid provider' });
    }

    const videos = await videoService.search(query);
    res.json(videos);
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({ message: error.message || 'Error searching videos' });
  }
});

app.get('/api/videos/:provider/:id/transcription', async (req, res) => {
  try {
    const { provider, id } = req.params;

    const videoService = videoServices[provider];
    if (!videoService) {
      return res.status(400).json({ message: 'Invalid provider' });
    }
    
    const transcription = await videoService.getTranscription(id);
    res.json(transcription);
  } catch (error) {
    console.error('Error fetching transcription:', error);
    res.status(500).json({
      text: "This is a sample transcription for the requested video. In a real app, this would be fetched from YouTube's API or a transcription service. For Brazilian Jiu-Jitsu videos, this transcription would contain detailed explanations of techniques, positions, and strategies."
    });
  }
});

// API endpoints for user's videos
app.get('/api/users/:userId/videos', async (req, res) => {
  try {
    const { userId } = req.params;
    const videos = await getUserVideos(userId);
    res.json(videos);
  } catch (error) {
    console.error('Error fetching saved videos:', error);
    res.status(500).json({ message: 'Error fetching saved videos' });
  }
});

app.post('/api/users/:userId/videos', async (req, res) => {
  try {
    const { userId } = req.params;
    const video = req.body;
    
    if (!video || !video.id || !video.provider) {
      return res.status(400).json({ message: 'Invalid video data' });
    }
    
    const videos = await getUserVideos(userId);
    
    const exists = videos.some(v => v.id === video.id && v.provider === video.provider);
    if (exists) {
      return res.status(409).json({ message: 'Video already saved' });
    }
    
    videos.push({ ...video, saved: true });
    
    await saveUserVideos(userId, videos);
    
    res.status(201).json({ message: 'Video saved successfully' });
  } catch (error) {
    console.error('Error saving video:', error);
    res.status(500).json({ message: 'Error saving video' });
  }
});

app.delete('/api/users/:userId/videos/:provider/:videoId', async (req, res) => {
  try {
    const { userId, provider, videoId } = req.params;
    
    const videos = await getUserVideos(userId);
    
    const updatedVideos = videos.filter(v => !(v.id === videoId && v.provider === provider));
    
    if (videos.length === updatedVideos.length) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    await saveUserVideos(userId, updatedVideos);
    
    res.json({ message: 'Video removed successfully' });
  } catch (error) {
    console.error('Error removing video:', error);
    res.status(500).json({ message: 'Error removing video' });
  }
});

app.get('/api/users/:userId/videos/:provider/:videoId/exists', async (req, res) => {
  try {
    const { userId, provider, videoId } = req.params;
    
    const videos = await getUserVideos(userId);
    
    const exists = videos.some(v => v.id === videoId && v.provider === provider);
    
    res.json({ exists });
  } catch (error) {
    console.error('Error checking if video exists:', error);
    res.status(500).json({ message: 'Error checking if video exists' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
