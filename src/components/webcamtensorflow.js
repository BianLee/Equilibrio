"use client";

import { useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";

export default function WebcamTensorFlow() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    async function setupCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Browser API navigator.mediaDevices.getUserMedia not available"
        );
      }

      const video = videoRef.current;
      video.width = 640;
      video.height = 480;
      video.srcObject = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve(video);
        };
      });
    }

    async function loadPosenet() {
      const net = await posenet.load();
      console.log("PoseNet model loaded.");
      return net;
    }

    async function detectPoseInRealTime(video, net) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = 640;
      canvas.height = 480;

      async function poseDetectionFrame() {
        const pose = await net.estimateSinglePose(video, {
          flipHorizontal: false,
        });

        drawCanvas(pose, video, canvas, ctx);
        requestAnimationFrame(poseDetectionFrame);
      }

      poseDetectionFrame();
    }

    function drawCanvas(pose, video, canvas, ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      drawKeypoints(pose.keypoints, 0.6, ctx);
      ctx.restore();
    }

    function drawKeypoints(keypoints, minConfidence, ctx) {
      keypoints.forEach((keypoint) => {
        if (keypoint.score >= minConfidence) {
          const { y, x } = keypoint.position;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fillStyle = "aqua";
          ctx.fill();
        }
      });
    }

    setupCamera().then((video) => {
      video.play();
      loadPosenet().then((net) => {
        detectPoseInRealTime(video, net);
      });
    });
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} />
    </div>
  );
}
