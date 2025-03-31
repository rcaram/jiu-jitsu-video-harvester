
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import VideoCard from "@/components/VideoCard";
import { VideoData } from "@/services/videoService";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useVideo } from "@/services/videoService";
import { useAuth } from "@clerk/clerk-react";

const SavedVideos = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getSavedVideos, removeVideo } = useVideo();
  const { isSignedIn } = useAuth();
  
  useEffect(() => {
    const loadSavedVideos = async () => {
      setIsLoading(true);
      const savedVideos = await getSavedVideos();
      setVideos(savedVideos);
      setIsLoading(false);
    };
    
    loadSavedVideos();
  }, [getSavedVideos]);

  const handleRemove = async (videoId: string) => {
    await removeVideo(videoId);
    setVideos(videos.filter(v => v.id !== videoId));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-bjj-blue">Saved Videos</h1>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-blue"></div>
          </div>
        </div>
      </Layout>
    );
  }

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
                {isSignedIn 
                  ? "You haven't saved any BJJ videos yet. Search for videos and save them to your collection."
                  : "Sign in to save and access your BJJ videos across devices."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-bjj-blue hover:bg-bjj-accent" asChild>
                  <a href="/">Search Videos</a>
                </Button>
                {!isSignedIn && (
                  <Button variant="outline" asChild>
                    <a href="/sign-in">Sign In</a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SavedVideos;
