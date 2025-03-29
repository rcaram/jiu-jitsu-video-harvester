
import { Link, useLocation } from "react-router-dom";
import { Search, BookmarkIcon, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <header className="bg-bjj-blue text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <span className="mr-2">🥋</span>
            <span>BJJ Video Harvester</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-6">
        {children}
      </div>

      <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-around">
            <Link 
              to="/" 
              className={cn(
                "flex flex-col items-center py-3 px-4 text-sm transition-colors",
                isActive("/") ? "text-bjj-blue font-medium" : "text-gray-500 hover:text-bjj-blue"
              )}
            >
              <Home size={20} />
              <span className="mt-1">Home</span>
            </Link>
            <Link 
              to="/saved" 
              className={cn(
                "flex flex-col items-center py-3 px-4 text-sm transition-colors",
                isActive("/saved") ? "text-bjj-blue font-medium" : "text-gray-500 hover:text-bjj-blue"
              )}
            >
              <BookmarkIcon size={20} />
              <span className="mt-1">Saved</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
