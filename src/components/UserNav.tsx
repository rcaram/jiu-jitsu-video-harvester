
import { UserButton, useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";

export function UserNav() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex items-center gap-4">
      {isSignedIn ? (
        <UserButton 
          afterSignOutUrl="/login"
          appearance={{
            elements: {
              userButtonBox: "h-8 w-8",
            }
          }}
        />
      ) : (
        <Button variant="outline" asChild size="sm">
          <Link to="/login" className="flex items-center gap-2">
            <LogIn size={16} />
            <span>Login</span>
          </Link>
        </Button>
      )}
    </div>
  );
}
