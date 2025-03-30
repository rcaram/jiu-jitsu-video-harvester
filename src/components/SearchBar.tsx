
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Youtube } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const SearchBar = ({ onSearch, isLoading = false }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2">
        <Youtube size={24} className="text-red-600" />
        <h3 className="text-lg font-medium">Search YouTube for BJJ Videos</h3>
      </div>
      
      <div className="flex gap-2 w-full">
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
