
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  getVideoById, 
  VideoData, 
  saveVideo, 
  removeVideo, 
  videoExists,
  getTranscription 
} from "@/services/videoService";
import { BookmarkPlus, Trash2, ExternalLink, User, Calendar, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VideoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [saved, setSaved] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);

  useEffect(() => {
    if (id) {
      const videoData = getVideoById(id);
      if (videoData) {
        setVideo(videoData);
        setSaved(true);
        setTranscription(videoData.transcription || "");
      } else {
        // For demo purposes, create a mock video if not in storage
        setVideo({
          id,
          title: "Brazilian Jiu-Jitsu Technique Demo",
          description: "This is a detailed breakdown of an essential BJJ technique that every practitioner should know. The video covers proper form, common mistakes, and variations for different body types and skill levels.",
          thumbnail: "https://via.placeholder.com/640x360?text=BJJ+Video",
          publishedAt: "2023-09-15T14:30:00Z",
          viewCount: "187,432",
          channelTitle: "BJJ Masters",
          link: `https://youtube.com/watch?v=${id}`
        });
        setSaved(videoExists(id));
      }
    }
  }, [id]);

  const fetchTranscription = async () => {
    if (!transcription && id) {
      setIsLoadingTranscript(true);
      try {
        const text = await getTranscription(id);
        setTranscription(text);
        
        // If the video is saved, update it with the transcription
        if (saved && video) {
          const updatedVideo = { ...video, transcription: text };
          saveVideo(updatedVideo);
          setVideo(updatedVideo);
        }
      } catch (error) {
        console.error("Error fetching transcription:", error);
        toast.error("Failed to load transcription");
      } finally {
        setIsLoadingTranscript(false);
      }
    }
  };

  const handleSave = () => {
    if (video) {
      if (!saved) {
        const videoToSave = { ...video };
        if (transcription) {
          videoToSave.transcription = transcription;
        }
        saveVideo(videoToSave);
        setSaved(true);
        toast.success("Video saved to your collection!");
      } else {
        removeVideo(video.id);
        setSaved(false);
        toast.success("Video removed from your collection");
      }
    }
  };

  if (!video) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  const publishedDate = new Date(video.publishedAt);
  const timeAgo = formatDistanceToNow(publishedDate, { addSuffix: true });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          ← Back
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="aspect-video bg-gray-200 relative">
            <img 
              src={video.thumbnail || "https://via.placeholder.com/640x360?text=BJJ+Video"} 
              alt={video.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
            
            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4 gap-x-4 gap-y-2">
              <span className="flex items-center">
                <User size={16} className="mr-1" />
                {video.channelTitle}
              </span>
              <span className="flex items-center">
                <Eye size={16} className="mr-1" />
                {video.viewCount} views
              </span>
              <span className="flex items-center">
                <Calendar size={16} className="mr-1" />
                {timeAgo}
              </span>
            </div>
            
            <div className="flex gap-3 mb-6">
              <Button 
                variant={saved ? "destructive" : "default"}
                onClick={handleSave}
                className={saved ? "" : "bg-bjj-blue hover:bg-bjj-accent"}
              >
                {saved ? (
                  <>
                    <Trash2 size={16} className="mr-2" />
                    Remove from saved
                  </>
                ) : (
                  <>
                    <BookmarkPlus size={16} className="mr-2" />
                    Save video
                  </>
                )}
              </Button>
              
              <Button variant="outline" asChild>
                <a href={video.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16} className="mr-2" />
                  Watch on YouTube
                </a>
              </Button>
            </div>
            
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="transcript" onClick={fetchTranscription}>Transcription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-line">{video.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="transcript">
                <Card>
                  <CardContent className="pt-6">
                    {isLoadingTranscript ? (
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ) : transcription ? (
                      <div>
                        <h3 className="font-semibold mb-2">Video Transcription</h3>
                        <div className="text-gray-700 whitespace-pre-line">
                          {transcription}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">Click to load the video transcription</p>
                        <Button 
                          onClick={fetchTranscription} 
                          className="mt-4 bg-bjj-blue hover:bg-bjj-accent"
                        >
                          Load Transcription
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VideoDetail;
