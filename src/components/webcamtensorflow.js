"use client";

import { useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";

function WebcamTensorFlow() {
  console.log("hello");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const runPosenet = async () => {
    const net = await posenet.load();
    console.log("PoseNet Model Loaded.");

    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    if (
      typeof videoRef.current !== "undefined" &&
      videoRef.current !== null &&
      videoRef.current.readyState === 4
    ) {
      const video = videoRef.current;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      video.width = videoWidth;
      video.height = videoHeight;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      const pose = await net.estimateSinglePose(video, {
        flipHorizontal: false,
      });
      drawCanvas(pose, video, ctx);
    }
  };

  const drawCanvas = (pose, video, ctx) => {
    ctx.drawImage(video, 0, 0);
    // Draw keypoints and skeleton
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.5) {
        const { y, x } = keypoint.position;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "Red";
        ctx.fill();
      }
    });
  };

  useEffect(() => {
    runPosenet();
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        width="640"
        height="480"
      />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
    </div>
  );
}

export default WebcamTensorFlow;
