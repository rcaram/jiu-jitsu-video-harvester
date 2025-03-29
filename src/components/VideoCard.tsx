
import { VideoData, saveVideo, videoExists } from "@/services/videoService";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookmarkPlus, Eye, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface VideoCardProps {
  video: VideoData;
  isSaved?: boolean;
}

const VideoCard = ({ video, isSaved = false }: VideoCardProps) => {
  const [saved, setSaved] = useState(isSaved || videoExists(video.id));
  
  const handleSave = () => {
    if (!saved) {
      saveVideo(video);
      setSaved(true);
      toast.success("Video saved to your collection!");
    }
  };
  
  const publishedDate = new Date(video.publishedAt);
  const timeAgo = formatDistanceToNow(publishedDate, { addSuffix: true });

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <Link to={`/video/${video.id}`} className="flex-1">
        <div className="aspect-video bg-gray-200 relative">
          <img 
            src={video.thumbnail || "https://via.placeholder.com/640x360?text=BJJ+Video"} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">{video.title}</h3>
          <p className="text-sm text-gray-500 mb-2">{video.channelTitle}</p>
          <p className="text-sm text-gray-700 line-clamp-2">{video.description}</p>
          
          <div className="flex items-center mt-3 text-xs text-gray-500 space-x-3">
            <span className="flex items-center">
              <Eye size={14} className="mr-1" />
              {video.viewCount} views
            </span>
            <span className="flex items-center">
              <Calendar size={14} className="mr-1" />
              {timeAgo}
            </span>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="border-t p-3">
        <Button 
          variant={saved ? "secondary" : "default"}
          className={saved ? "w-full bg-gray-100 text-gray-600" : "w-full bg-bjj-blue hover:bg-bjj-accent"}
          onClick={handleSave}
          disabled={saved}
        >
          <BookmarkPlus size={16} className="mr-2" />
          {saved ? "Saved" : "Save Video"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VideoCard;
