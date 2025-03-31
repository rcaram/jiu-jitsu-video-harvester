
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

// Get Clerk publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if we have a valid publishable key
const hasValidClerkKey = PUBLISHABLE_KEY && PUBLISHABLE_KEY.startsWith('pk_');

// Create the root element for React rendering
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");
const root = createRoot(rootElement);

// Render the app, conditionally wrapping with ClerkProvider if we have a valid key
if (hasValidClerkKey) {
  root.render(
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      clerkJSVersion="5.56.0-snapshot.v20250312225817"
      signInUrl="/sign-in"
      signUpUrl="/sign-up" 
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/"
      afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  );
} else {
  // If no valid Clerk key is found, render the app without ClerkProvider and show warning
  console.warn(
    "No valid Clerk publishable key found. Authentication features will not work. " +
    "Please add your VITE_CLERK_PUBLISHABLE_KEY to .env file."
  );
  
  root.render(<App />);
}
