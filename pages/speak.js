// pages/speak.js
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

function Speak() {
  const audioContextRef = useRef(null);
  const socketRef = useRef(null);
  const audioQueue = useRef([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  const generateText = async () => {
    try {
      const response = await axios.post("/api/generate-text", { userInput });
      if (response.data.generatedText) {
        setGeneratedText(response.data.generatedText);
        startTTSStream(response.data.generatedText);
      }
    } catch (error) {
      console.error("Error generating text:", error);
    }
  };

  // Additional functions: startTTSStream and processNextAudioChunk
  // These functions remain largely the same as in your provided snippet

  return (
    <center>
      <h1>OpenAI and ElevenLab Integration</h1>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Type your message here"
      />
      <br />
      <button onClick={generateText}>Generate and Speak</button>
      <p>Generated Text: {generatedText}</p>
    </center>
  );
}

export default Speak;
