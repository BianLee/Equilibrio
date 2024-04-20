"use client";

import { useEffect, useRef, useState } from "react";
import { centralizePoints, shoulderInFrame } from "./relativePosition.js";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";

export default function WebcamTensorFlow() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [pose, setPose] = useState(null); // State to store the current pose

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
      const net = await posenet.load();  // returns posenet.PoseNet object
      return net;
    }

    async function detectPoseInRealTime(video, net) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = 640;
      canvas.height = 480;

      async function poseDetectionFrame() {
        // uses the loaded PoseNet object (#33) 
        const static_pose = await net.estimateSinglePose(video, {
          flipHorizontal: false,
        });
        const relative_pose = centralizePoints(JSON.parse(JSON.stringify(static_pose)));
        setPose(relative_pose); // Update the pose state with the latest pose

        drawCanvas(static_pose, video, canvas, ctx);
        requestAnimationFrame(poseDetectionFrame);
      }
      poseDetectionFrame();
    }

    setupCamera().then((video) => {
      video.play();
      loadPosenet().then((net) => {
        detectPoseInRealTime(video, net);
      });
    });
  }, []);

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

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} />
      {pose && <PoseTable pose={pose} />}
    </div>
  );
}

function PoseTable({ pose }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Part</th>
          <th>Score</th>
          <th>X</th>
          <th>Y</th>
        </tr>
      </thead>
      <tbody>
        {pose.keypoints.map((keypoint, index) => (
          <tr key={index}>
            <td>{keypoint.part}</td>
            <td>{keypoint.score.toFixed(2)}</td>
            <td>{keypoint.position.x.toFixed(2)}</td>
            <td>{keypoint.position.y.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
