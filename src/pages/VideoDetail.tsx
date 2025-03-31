
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VideoData, CaptionTrack } from "@/services/videoService";
import { BookmarkPlus, Trash2, ExternalLink, User, Calendar, Eye, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useVideo } from "@/services/videoService";
import { useAuth } from "@clerk/clerk-react";

const VideoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [saved, setSaved] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [captionTracks, setCaptionTracks] = useState<CaptionTrack[]>([]);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [tracksOpen, setTracksOpen] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const { getVideoById, videoExists, saveVideo, removeVideo, getTranscription } = useVideo();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const checkVideoStatus = async () => {
      if (id) {
        setIsCheckingStatus(true);
        // Check if video is saved
        const exists = await videoExists(id);
        setSaved(exists);
        
        // Get video data if saved
        const videoData = await getVideoById(id);
        
        if (videoData) {
          setVideo(videoData);
          setTranscription(videoData.transcription || "");
          if (videoData.captionTracks) {
            setCaptionTracks(videoData.captionTracks);
          }
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
        }
        setIsCheckingStatus(false);
      }
    };
    
    checkVideoStatus();
  }, [id, getVideoById, videoExists]);

  const fetchTranscription = async () => {
    if (id) {
      setIsLoadingTranscript(true);
      try {
        const result = await getTranscription(id);
        setTranscription(result.text);
        
        if (result.tracks && result.tracks.length > 0) {
          setCaptionTracks(result.tracks);
          setTracksOpen(true);
        }
        
        // If the video is saved, update it with the transcription and tracks
        if (saved && video) {
          const updatedVideo = { 
            ...video, 
            transcription: result.text,
            captionTracks: result.tracks
          };
          await saveVideo(updatedVideo);
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

  const handleTrackSelect = (trackId: string) => {
    setSelectedTrackId(trackId);
    const track = captionTracks.find(t => t.id === trackId);
    if (track) {
      toast.info(`Selected ${track.language} track. In a full implementation, this would load the specific caption content.`);
    }
  };

  const handleSaveAction = async () => {
    if (!isSignedIn) {
      if (saved) {
        // Allow unauthenticated users to remove videos from local storage
        await removeVideo(video!.id);
        setSaved(false);
      } else {
        // Redirect to sign in for saving videos if not authenticated
        toast.info("Sign in to save videos to your collection");
        navigate("/sign-in");
        return;
      }
    } else if (video) {
      if (!saved) {
        const videoToSave = { ...video };
        if (transcription) {
          videoToSave.transcription = transcription;
        }
        if (captionTracks.length > 0) {
          videoToSave.captionTracks = captionTracks;
        }
        await saveVideo(videoToSave);
        setSaved(true);
      } else {
        await removeVideo(video.id);
        setSaved(false);
      }
    }
  };

  if (isCheckingStatus || !video) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading video details...</p>
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
                onClick={handleSaveAction}
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
                        <div className="text-gray-700 whitespace-pre-line mb-4">
                          {transcription}
                        </div>
                        
                        {captionTracks.length > 0 && (
                          <div className="mt-6 border rounded-md">
                            <Collapsible
                              open={tracksOpen}
                              onOpenChange={setTracksOpen}
                              className="w-full"
                            >
                              <div className="flex items-center px-4 py-3 border-b">
                                <div className="flex gap-2 items-center flex-1">
                                  <FileText size={16} />
                                  <h4 className="font-medium">Available Caption Tracks</h4>
                                </div>
                                <CollapsibleTrigger className="flex items-center justify-center">
                                  <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                                    {tracksOpen ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                              
                              <CollapsibleContent>
                                <div className="p-3 space-y-2">
                                  {captionTracks.map((track) => (
                                    <div 
                                      key={track.id}
                                      className={`p-3 border rounded-md cursor-pointer transition-colors hover:bg-blue-50 ${
                                        selectedTrackId === track.id 
                                          ? 'bg-blue-100 border-blue-300' 
                                          : 'bg-white border-gray-200'
                                      }`}
                                      onClick={() => handleTrackSelect(track.id)}
                                    >
                                      <div className="font-medium">{track.name || track.language.toUpperCase()}</div>
                                      <div className="text-sm text-gray-500">
                                        Language: {track.language}, Type: {track.trackKind}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        )}
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
