
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import VideoCard from "@/components/VideoCard";
import { getSavedVideos, VideoData, removeVideo } from "@/services/videoService";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const SavedVideos = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  
  useEffect(() => {
    const savedVideos = getSavedVideos();
    setVideos(savedVideos);
  }, []);

  const handleRemove = (videoId: string) => {
    removeVideo(videoId);
    setVideos(videos.filter(v => v.id !== videoId));
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-bjj-blue">Saved Videos</h1>
        
        {videos.length > 0 ? (
          <>
            <p className="text-gray-600 mb-6">You have {videos.length} saved videos.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="relative">
                  <VideoCard video={video} isSaved={true} />
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemove(video.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-md mx-auto">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-medium mb-2">No Saved Videos</h3>
              <p className="text-gray-600 mb-4">
                You haven't saved any BJJ videos yet. Search for videos and save them to your collection.
              </p>
              <Button className="bg-bjj-blue hover:bg-bjj-accent" asChild>
                <a href="/">Search Videos</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SavedVideos;
