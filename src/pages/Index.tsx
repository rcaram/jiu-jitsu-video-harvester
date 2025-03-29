
import { useState } from "react";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import VideoCard from "@/components/VideoCard";
import { VideoData, searchVideos } from "@/services/videoService";
import { toast } from "sonner";

const Index = () => {
  const [searchResults, setSearchResults] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const results = await searchVideos(query);
      setSearchResults(results);
      setHasSearched(true);
      
      if (results.length === 0) {
        toast.info("No videos found. Try a different search term.");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search videos. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-bjj-blue">
            Brazilian Jiu-Jitsu Video Harvester
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Search, save, and analyze your favorite BJJ instructional videos and techniques
          </p>
          
          <div className="mb-8">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>
        </section>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <>
            {hasSearched && (
              <section>
                <h2 className="text-xl font-semibold mb-4">
                  {searchResults.length > 0 
                    ? `Found ${searchResults.length} videos` 
                    : "No videos found"}
                </h2>
                
                {searchResults.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {!hasSearched && (
              <div className="text-center py-12">
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-md mx-auto">
                  <div className="text-6xl mb-4">🥋</div>
                  <h3 className="text-xl font-medium mb-2">Search for BJJ Videos</h3>
                  <p className="text-gray-600">
                    Enter techniques, positions, or instructors to find relevant Brazilian Jiu-Jitsu videos.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;
