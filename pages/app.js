"use client";
import "../src/app/globals.css";
import dynamic from "next/dynamic";
import Link from "next/link";
import axios from "axios";

import React, { useState, useEffect } from "react";

const WebcamTensorFlow = dynamic(
  () => import("../src/components/webcamtensorflow"),
  { ssr: false } // This disables server-side rendering for this component
);
// import WebcamTensorFlow from "../src/components/webcamtensorflow";
import useInitializeAuth from "../src/hooks/authHook";
import { useRouter } from "next/navigation";

import useAuthStore from "../stores/authStore";
import { supabase } from "../src/utils/supabaseClient";

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

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [audioUrl, setAudioUrl] = useState("");

  const handleAudioGeneration = async (message) => {
    // Set the API key for ElevenLabs API.
    // Do not use directly. Use environment variables.
    const API_KEY = "6ec6a451d2ee80120d295ed14bd80e10";
    // Set the ID of the voice to be used.
    const VOICE_ID = "5BtoxJWuomqxGLNvKwal";

    // Set options for the API request.
    const options = {
      method: "POST",
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        accept: "audio/mpeg", // Set the expected response type to audio/mpeg.
        "content-type": "application/json", // Set the content type to application/json.
        "xi-api-key": `${API_KEY}`, // Set the API key in the headers.
      },
      data: {
        text: message || "hello", // Pass in the inputText as the text to be converted to speech.
      },
      responseType: "arraybuffer", // Set the responseType to arraybuffer to receive binary data as response.
    };

    try {
      const response = await axios.request(options);
      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
    } catch (error) {
      console.error("Error generating audio:", error);
    }
  };

  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && message.trim()) {
      event.preventDefault(); // Prevent form submission on enter key
      setMessages((prevMessages) => [...prevMessages, message]);
      setMessage(""); // Clear the input after sending
    }
  };

  const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setAuth(null);
    } else {
      console.error("Sign out error:", error.message);
    }
  };

  // Use the useEffect hook to call the handleAudioFetch function once when the component mounts
  useEffect(() => {
    handleAudioGeneration();
  }, []);
  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <nav className="relative flex items-center justify-center py-4">
          <Link href="/">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
              equilibr.io
            </h1>
          </Link>
          <button
            className="absolute right-4 bg-gray-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={isAuthenticated ? signOutUser : handleLogin}
          >
            {isAuthenticated ? "Log Out" : "Login"}
          </button>
        </nav>

        <div className="px-4 py-2">
          <div className="flex -mx-2">
            <div className="w-1/2 px-2">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="mt-2 text-gray-800 text-sm">Feedback:</p>
                <div className="flex mt-2 justify-center">
                  <WebcamTensorFlow />
                </div>
              </div>
            </div>
            <div className="w-1/2 px-2">
              <div className="bg-white p-4 rounded-lg shadow h-full flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  {messages.map((msg, index) => (
                    <div key={index} className="p-2 m-2 bg-blue-100 rounded">
                      {msg}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={message}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div className="w-1/2 px-2">
                  {/* Existing Message Box Code */}
                  <button
                    onClick={() => handleAudioGeneration(message)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Generate Audio
                  </button>
                  {audioUrl && (
                    <audio controls src={audioUrl} className="mt-4">
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
