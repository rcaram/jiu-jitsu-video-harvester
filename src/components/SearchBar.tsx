
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Youtube, Video } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Provider = "youtube" | "vimeo" | "bilibili";

interface SearchBarProps {
  onSearch: (query: string, provider: Provider) => void;
  isLoading?: boolean;
}

const SearchBar = ({ onSearch, isLoading = false }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState<Provider>("youtube");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, provider);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2">
        <Video size={24} className="text-bjj-blue" />
        <h3 className="text-lg font-medium">Search for BJJ Videos</h3>
      </div>
      
      <div className="flex gap-2 w-full">
        <Select value={provider} onValueChange={(value) => setProvider(value as Provider)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="youtube">
              <div className="flex items-center gap-2">
                <Youtube size={16} className="text-red-600" /> YouTube
              </div>
            </SelectItem>
            <SelectItem value="vimeo" disabled>Vimeo</SelectItem>
            <SelectItem value="bilibili" disabled>Bilibili</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search for BJJ techniques, positions, instructors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-10 border-2 focus-visible:ring-bjj-accent"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !query.trim()} 
          className="bg-bjj-blue hover:bg-bjj-accent"
        >
          {isLoading ? (
            "Searching..."
          ) : (
            <>
              <Search size={18} className="mr-2" /> Search
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-gray-500 text-center">
        Searches are enhanced with "BJJ" and "Brazilian Jiu Jitsu" keywords for better results
      </p>
    </form>
  );
};

export default SearchBar;
