
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignIn, SignUp } from "@clerk/clerk-react";

const Login = () => {
  const { isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<"sign-in" | "sign-up">("sign-in");

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-bjj-blue">BJJ Video Library</h1>
          <p className="mt-2 text-gray-600">
            Sign in to access your saved BJJ technique videos
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <Tabs 
            defaultValue="sign-in" 
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "sign-in" | "sign-up")}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="sign-in">Sign In</TabsTrigger>
              <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sign-in" className="mt-0">
              <SignIn 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "",
                    header: "hidden",
                    footer: "hidden",
                    formButtonPrimary: "bg-bjj-blue hover:bg-bjj-accent",
                  }
                }}
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto" 
                    onClick={() => setActiveTab("sign-up")}
                  >
                    Sign up
                  </Button>
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="sign-up" className="mt-0">
              <SignUp 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "",
                    header: "hidden",
                    footer: "hidden",
                    formButtonPrimary: "bg-bjj-blue hover:bg-bjj-accent",
                  }
                }}
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto" 
                    onClick={() => setActiveTab("sign-in")}
                  >
                    Sign in
                  </Button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;
