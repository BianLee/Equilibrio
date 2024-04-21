"use client";
import "../src/app/globals.css";
import dynamic from "next/dynamic";
import Link from "next/link";
import axios from "axios";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.NEXT_PUBLIC_API;
const instructions = "";
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
  const [input, setInput] = useState("");
  const [responseData, setResponseData] = useState("");
  const audioRef = React.createRef();

  async function runChat() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 400,
    };

    const safetySettings = [
      // Existing safety settings
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    });

    const result = await chat.sendMessage(input + instructions);
    const response = result.response.text();

    console.log(response);
    if (response) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: input, sender: "user" },
        { text: response, sender: "gemini" },
      ]);
      setResponseData(response);
      setInput("");
    }
  }

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
    if (!message) return;
    runChat();
    // Set the API key for ElevenLabs API.
    // Do not use directly. Use environment variables.
    const API_KEY = "6ec6a451d2ee80120d295ed14bd80e10";
    // Set the ID of the voice to be used.
    const VOICE_ID = "5BtoxJWuomqxGLNvKwal";

    setMessage(""); // Clear the input after sending
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

  useEffect(() => {
    if (message.trim()) {
      // Check if the message is not just empty or spaces
      handleAudioGeneration(message);
    }
  }, []);

  const handleInputChange = (event) => {
    setInput(event.target.value);
    setMessage(event.target.value);
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && message.trim()) {
      event.preventDefault(); // Prevent form submission on enter key
      setMessages((prevMessages) => [...prevMessages, message]);
      setMessage(""); // Clear the input after sending
    }
  };
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((e) => {
        console.error("Playback failed:", e);
      });
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
        {/* 
        <main className="flex min-h-screen flex-col items-center justify-between bg-black ">
          <div className="z-10 max-w-5xl w-full items-center bg-slate-400 justify-center h-screen font-mono text-sm lg:flex">
            <div>
              <div className="bg-blue-600 rounded-xl my-6">
                <h1 className="text-2xl p-4">
                  Setting Up Google Gemini in Next.js
                </h1>
              </div>
              <h1>Output</h1>
              <textarea
                value={responseData}
                readOnly
                rows={40}
                className="w-full"
              ></textarea>
              <div className="flex flex-col m-4">
                <h1>Input</h1>
                <textarea
                  className="w-full"
                  value={input}
                  rows={3}
                  onChange={(e) => setInput(e.target.value)}
                ></textarea>
                <button
                  className="m-4 bg-slate-200 rounded-xl hover:bg-slate-700"
                  onClick={runChat}
                >
                  Run Gemini-Pro
                </button>
              </div>
            </div>
          </div>
        </main>
        */}
        <nav className="relative flex items-center justify-center py-4">
          <Link href="/">
            <h1 className="text-5xl font-bold bg-clip-text">Equilibrio</h1>
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
                    <div
                      key={index}
                      className={`p-2 m-2 rounded ${
                        msg.sender === "user" ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={message}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setMessage(e.target.value);
                    }}
                  />
                </div>
                <button
                  onClick={() => handleAudioGeneration(message)}
                  className="..."
                >
                  Send
                </button>

                {audioUrl && (
                  <audio
                    controls
                    autoPlay
                    ref={audioRef}
                    src={audioUrl}
                    onLoadedData={playAudio}
                    style={{ display: "none" }} // Hides the audio element visually
                  >
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
