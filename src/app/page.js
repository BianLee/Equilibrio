"use client";

import WebcamTensorFlow from "../components/webcamtensorflow";
import useInitializeAuth from "../hooks/authHook";
import { useRouter } from "next/navigation";

import useAuthStore from "../../stores/authStore";
import { supabase } from "../../src/utils/supabaseClient";

export default function Home() {
  useInitializeAuth();
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    setAuth: state.setAuth,
  }));
  const handleLogin = () => {
    router.push("/signin");
  };

  const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setAuth(null);
    } else {
      console.error("Sign out error:", error.message);
    }
  };

  return (
    <>
      {" "}
      {!isAuthenticated && (
        <button type="button" onClick={handleLogin}>
          Login
        </button>
      )}
      {isAuthenticated && (
        <button type="button" onClick={signOutUser}>
          Log Out
        </button>
      )}
      <div className="flex m-4 mt-6">
        <div className="flex-1 mr-1">
          <WebcamTensorFlow />
        </div>
        <div className="flex-1 ml-1">
          <div className="flex flex-col h-full border-2 border-gray-300 p-4 rounded-lg">
            <div className="flex-1 overflow-y-auto p-2 mb-4 bg-white rounded-lg shadow">
              <p>Your messages will appear here...</p>
            </div>
            <div className="mt-auto">
              <input
                type="text"
                placeholder="Type your message here..."
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
