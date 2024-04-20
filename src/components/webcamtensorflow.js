"use client";

import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";

export default function WebcamTensorFlow() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [poses, setPoses] = useState([]); // State to store poses

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
        updatePoses(pose); // Update the poses state
        requestAnimationFrame(poseDetectionFrame);
      }
      poseDetectionFrame();
    }

    function updatePoses(pose) {
      setPoses((prevPoses) => [...prevPoses, pose]);
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
      <PoseTable poses={poses} />
    </div>
  );
}

function PoseTable({ poses }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Frame</th>
          <th>Person</th>
          <th>Score</th>
          <th>Nose Score</th>
          <th>Nose X</th>
          <th>Nose Y</th>
          <th>Left Eye Score</th>
          <th>Left Eye X</th>
          <th>Left Eye Y</th>
          <th>Left Ankle Score</th>
          <th>Left Ankle X</th>
          <th>Left Ankle Y</th>
          <th>Right Ankle Score</th>
          <th>Right Ankle X</th>
          <th>Right Ankle Y</th>
        </tr>
      </thead>
      <tbody>
        {poses.map((pose, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>1</td> {/* Assuming one person for simplicity */}
            <td>{pose.score.toFixed(2)}</td>
            {pose.keypoints
              .filter((kp) =>
                ["nose", "leftEye", "leftAnkle", "rightAnkle"].includes(kp.part)
              )
              .map((kp) => (
                <>
                  <td>{kp.score.toFixed(2)}</td>
                  <td>{kp.position.x.toFixed(2)}</td>
                  <td>{kp.position.y.toFixed(2)}</td>
                </>
              ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
