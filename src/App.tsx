
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from "@clerk/clerk-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SavedVideos from "./pages/SavedVideos";
import VideoDetail from "./pages/VideoDetail";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";

// Check if Clerk is available
const isClerkAvailable = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Protected route component that conditionally checks authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // If Clerk is not configured, allow access but show a notification or alternative UI
  if (!isClerkAvailable) {
    return <>{children}</>;
  }
  
  // If Clerk is configured, use the normal protection
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

const App = () => {
  // Create QueryClient inside the component
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect root to login if not signed in, to search if signed in */}
            <Route 
              path="/" 
              element={
                isClerkAvailable ? (
                  <SignedIn>
                    <Navigate to="/search" replace />
                  </SignedIn>
                ) : (
                  <Navigate to="/search" replace />
                )
              } 
            />
            <Route path="/search" element={<Index />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            {isClerkAvailable && (
              <>
                <Route path="/sign-in" element={<Navigate to="/login" replace />} />
                <Route path="/sign-up" element={<Navigate to="/login" replace />} />
              </>
            )}
            
            <Route 
              path="/saved" 
              element={
                <ProtectedRoute>
                  <SavedVideos />
                </ProtectedRoute>
              } 
            />
            <Route path="/video/:id" element={<VideoDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
