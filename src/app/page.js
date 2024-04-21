"use client";
import dynamic from "next/dynamic";
import Landing from "./landing";

const WebcamTensorFlow = dynamic(
  () => import("../components/webcamtensorflow"),
  { ssr: false } // This disables server-side rendering for this component
);

// import WebcamTensorFlow from "../components/webcamtensorflow";
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
      <Landing />
    </>
  );
}
