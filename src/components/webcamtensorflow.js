import { useEffect, useRef, useState } from "react";
import {
  centralizePoints,
  shoulderInFrame,
  handsAboveHead,
  kneesTogether,
  armsStraight,
  onAllFours,
  lowerHead,
  treePose,
  elbowsFlared
} from "./relativePosition.js";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";

const MIN_CONFIDENCE = 0.6;
const SNAPSHOT_INTERVAL = 10000; // milliseconds (10 seconds)

export default function WebcamTensorFlow() {
  const poseRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [pose, setPose] = useState(null); // State to store the current pose
  const selectedPosition = useRef("");
  // const [selectedPosition, setSelectedPosition] = useState("");

  const HAH = useRef(null); // hands above head boolean
  const KT = useRef(null); // knees together boolean
  const AS = useRef(null); // arms straight boolean
  const OAF = useRef(null); // on all fours boolean
  const LH = useRef(null); // lower head boolean
  const TP = useRef(null); // tree pose boolean
  const EF = useRef(null); // elbows flared boolean

  const current_pose = useRef(null);
  const advice = useRef(null);

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
        video.onloadedmetadata = () => resolve(video);
      });
    }

    async function loadPosenet() {
      return await posenet.load();
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
          ); // deep copies1 the static_pose and makes coordinates relative
          // export relative position data from live feed here
          HAH.current = handsAboveHead(relative_pose, MIN_CONFIDENCE);
          KT.current = kneesTogether(relative_pose, MIN_CONFIDENCE);
          AS.current = armsStraight(relative_pose, MIN_CONFIDENCE);
          OAF.current = onAllFours(relative_pose, MIN_CONFIDENCE);
          LH.current = lowerHead(relative_pose, MIN_CONFIDENCE);
          TP.current = treePose(relative_pose, MIN_CONFIDENCE);
          EF.current = elbowsFlared(relative_pose, MIN_CONFIDENCE);
          console.log(HAH);

          // 
          // console.log(selectedPosition);  
          advice.current = printFeedback(static_pose, video, canvas, ctx, selectedPosition.current);
          setPose(relative_pose); // Update the pose state with the latest pose
          if (advice.current === "Yes, good job!") {
            successCanvas(static_pose, video, canvas, ctx);
          } else {
            drawCanvas(static_pose, video, canvas, ctx);
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
        setInterval(() => {
          if (poseRef.current) {
            console.log(
              "Periodic Pose Log:",
              new Date().toISOString(),
              poseRef.current
            );
            localStorage.setItem("lastPose", JSON.stringify(poseRef.current)); // Store latest pose in local storage
          }
        }, SNAPSHOT_INTERVAL);
      });
    });
  }, []);

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

  function successCanvas(pose, video, canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    drawKeypoints(pose.keypoints, ctx);
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 30;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
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

  function printFeedback(pose_points, video, canvas, ctx, pose) {
    if (pose === 'chair') {
      if (!HAH.current) {
        return 'Try to raise arms higher!';
      } else if (!KT.current) {
        return 'Try to put your knees together!';
      } else if (!AS.current) {
        return 'Try to straighten your arms!';
      } else {
        // successCanvas(pose_points, video, canvas, ctx);
        return 'Yes, good job!';
      }
    } else if (pose === 'dog') {
      if (!OAF.current) {
        return 'Try to get on all fours!';
      } else if (!HL.current) {
        return 'Try to lower your head!';
      } else {
        // successCanvas(pose_points, video, canvas, ctx);
        return 'Yes, good job!';
      }
    } else if (pose === 'tree') {
      if (!TP.current) {
        return 'Try to raise your leg up!';
      } else if (!EF.current) {
        return 'Try to flare our elbows!';
      } else {
        // successCanvas(pose_points, video, canvas, ctx);
        return 'Yes, good job!';
      }
    } else {
      return "Please select a pose.";
    }
  }

  function handlePositionChange(event) {
    selectedPosition.current = event.target.value
    // setSelectedPosition(event.target.value);
  }

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} />
      <div className="flex justify-center space-x-4 my-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="chair"
            checked={selectedPosition.current === "chair"}
            onChange={handlePositionChange}
            className="text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <span className="text-gray-700">Chair</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="tree"
            checked={selectedPosition.current === "tree"}
            onChange={handlePositionChange}
            className="text-green-600 focus:ring-green-500 border-gray-300"
          />
          <span className="text-gray-700">Tree</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="dog"
            checked={selectedPosition.current === "dog"}
            onChange={handlePositionChange}
            className="text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="text-gray-700">Dog</span>
        </label>
      </div>
      <div>
        <h3>Coach: {advice.current}</h3>
      </div>
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