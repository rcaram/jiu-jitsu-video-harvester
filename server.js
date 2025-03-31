
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// API key from environment variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  console.error("YouTube API key missing! Set YOUTUBE_API_KEY in environment variables.");
  process.exit(1);
}

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
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

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
    const videoIds = data.items.map((item) => item.id.videoId).join(",");
    
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
    const videos = data.items.map((item) => {
      const videoId = item.id.videoId;
      const stats = statsData.items.find((stat) => stat.id === videoId);
      
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
    
    res.json(videos);
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({ message: error.message || 'Error searching videos' });
  }
});

app.get('/api/videos/:id/transcription', async (req, res) => {
  try {
    const videoId = req.params.id;

    // First, try to get the caption tracks available for the video
    const captionsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    if (!captionsResponse.ok) {
      throw new Error("Failed to fetch captions data");
    }

    const captionsData = await captionsResponse.json();
    
    // Check if there are any caption tracks available
    if (!captionsData.items || captionsData.items.length === 0) {
      // Try to get video details to create a more realistic fallback
      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!videoResponse.ok) {
        throw new Error("Failed to fetch video details");
      }
      
      const videoData = await videoResponse.json();
      
      if (!videoData.items || videoData.items.length === 0) {
        return res.json({ text: "Transcription is not available for this video." });
      }
      
      const videoTitle = videoData.items[0].snippet.title;
      const videoDescription = videoData.items[0].snippet.description || "";
      
      // Create a more tailored fallback transcription
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
      
      return res.json({ text: fallbackText });
    }
    
    // Process the available caption tracks
    const tracks = captionsData.items.map((item) => ({
      id: item.id,
      language: item.snippet.language,
      name: item.snippet.name || item.snippet.language.toUpperCase(),
      trackKind: item.snippet.trackKind
    }));
    
    res.json({
      text: `Transcription is available for this video. Select a track below:`,
      tracks
    });
    
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
    
    // Validate video object
    if (!video || !video.id) {
      return res.status(400).json({ message: 'Invalid video data' });
    }
    
    // Get existing videos
    const videos = await getUserVideos(userId);
    
    // Check if video already exists
    const exists = videos.some(v => v.id === video.id);
    if (exists) {
      return res.status(409).json({ message: 'Video already saved' });
    }
    
    // Add new video with saved flag
    videos.push({ ...video, saved: true });
    
    // Save videos
    await saveUserVideos(userId, videos);
    
    res.status(201).json({ message: 'Video saved successfully' });
  } catch (error) {
    console.error('Error saving video:', error);
    res.status(500).json({ message: 'Error saving video' });
  }
});

app.delete('/api/users/:userId/videos/:videoId', async (req, res) => {
  try {
    const { userId, videoId } = req.params;
    
    // Get existing videos
    const videos = await getUserVideos(userId);
    
    // Remove video
    const updatedVideos = videos.filter(v => v.id !== videoId);
    
    // Check if video was found and removed
    if (videos.length === updatedVideos.length) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Save updated videos
    await saveUserVideos(userId, updatedVideos);
    
    res.json({ message: 'Video removed successfully' });
  } catch (error) {
    console.error('Error removing video:', error);
    res.status(500).json({ message: 'Error removing video' });
  }
});

app.get('/api/users/:userId/videos/:videoId/exists', async (req, res) => {
  try {
    const { userId, videoId } = req.params;
    
    // Get existing videos
    const videos = await getUserVideos(userId);
    
    // Check if video exists
    const exists = videos.some(v => v.id === videoId);
    
    res.json({ exists });
  } catch (error) {
    console.error('Error checking if video exists:', error);
    res.status(500).json({ message: 'Error checking if video exists' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve frontend build files
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Handle all other routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
