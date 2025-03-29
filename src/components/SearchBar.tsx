
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl mx-auto">
      <div className="flex-1 relative">
        <Input
          type="text"
          placeholder="Search for BJJ videos..."
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
    </form>
  );
};

export default SearchBar;
