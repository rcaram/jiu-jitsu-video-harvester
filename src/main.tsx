
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

// Get Clerk publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Default to a dummy key in development to avoid breaking the app
// This will show a special development banner but allow the app to load
const isDevelopment = import.meta.env.DEV;
const defaultDevKey = "pk_test_dummy-key-for-development";

// Use the actual key if available, otherwise use the dev key in development only
const clerkKey = PUBLISHABLE_KEY || (isDevelopment ? defaultDevKey : "");

if (!clerkKey) {
  throw new Error("Missing Clerk Publishable Key. Please set VITE_CLERK_PUBLISHABLE_KEY in your environment variables.");
}

// Render the app with Clerk provider
createRoot(document.getElementById("root")!).render(
  <ClerkProvider 
    publishableKey={clerkKey}
    clerkJSVersion="5.56.0-snapshot.v20250312225817"
    signInUrl="/sign-in"
    signUpUrl="/sign-up" 
    signInFallbackRedirectUrl="/dashboard"
    signUpFallbackRedirectUrl="/"
    afterSignOutUrl="/">
    <App />
  </ClerkProvider>
);
