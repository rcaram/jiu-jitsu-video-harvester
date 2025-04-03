
import { SignUp } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const SignUpPage = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/search" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-bjj-blue">BJJ Video Library</h1>
          <p className="text-gray-600 mt-2">Create an account to save your favorite videos</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg rounded-lg border border-gray-200",
              headerTitle: "text-bjj-blue font-bold",
              headerSubtitle: "text-gray-600",
              formButtonPrimary: "bg-bjj-blue hover:bg-bjj-accent",
            }
          }}
        />
      </div>
    </div>
  );
};

export default SignUpPage;
