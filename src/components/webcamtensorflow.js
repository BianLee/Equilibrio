import { useEffect, useRef, useState } from "react";
import { centralizePoints, shoulderInFrame } from "./relativePosition.js";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";

const MIN_CONFIDENCE = 0.6;
const SNAPSHOT_INTERVAL = 10000; // milliseconds (10 seconds)

export default function WebcamTensorFlow() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [pose, setPose] = useState(null);
  const [lastSnapshotTime, setLastSnapshotTime] = useState(Date.now());

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
        const static_pose = await net.estimateSinglePose(video, {
          flipHorizontal: false,
        });

        if (shoulderInFrame(static_pose, MIN_CONFIDENCE)) {
          const relative_pose = centralizePoints(
            JSON.parse(JSON.stringify(static_pose))
          );

          setPose(relative_pose);
          drawCanvas(static_pose, video, canvas, ctx);

          const currentTime = Date.now();
          if (currentTime - lastSnapshotTime >= SNAPSHOT_INTERVAL) {
            logPose(relative_pose);
            setLastSnapshotTime(currentTime);
          }
        } else {
          errorCanvas(video, canvas, ctx);
        }

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

  function logPose(pose) {
    console.log(
      "Snapshot at:",
      new Date(lastSnapshotTime).toISOString(),
      "Pose data:",
      pose
    );
  }

  function drawCanvas(pose, video, canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    drawKeypoints(pose.keypoints, ctx);
    ctx.restore();
  }

  function errorCanvas(video, canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.font = "24px sans-serif";
    ctx.fillText("Please keep both shoulders in frame.", 10, 34);
    ctx.restore();
  }

  function drawKeypoints(keypoints, ctx) {
    keypoints.forEach((keypoint) => {
      if (keypoint.score >= MIN_CONFIDENCE) {
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
      <div>Current Time: {new Date(lastSnapshotTime).toLocaleString()}</div>
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
