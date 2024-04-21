import * as tf from "@tensorflow/tfjs-node";
import posenet from "@tensorflow-models/posenet";
import { createCanvas, Image } from "canvas";
import fs from "fs";

async function estimatePose(imagePath) {
  const image = await loadImage(imagePath);
  const net = await posenet.load({
    architecture: "MobileNetV1",
    outputStride: 16,
    inputResolution: { width: 640, height: 480 },
  });

  // Estimate the pose
  const pose = await net.estimateSinglePose(image, {
    flipHorizontal: false,
  });

  // Output the keypoints
  console.log("Keypoints:");
  pose.keypoints.forEach((keypoint) => {
    console.log(
      `${keypoint.part}: x=${keypoint.position.x}, y=${keypoint.position.y}, confidence=${keypoint.score}`
    );
  });
}

async function loadImage(path) {
  const data = fs.readFileSync(path);
  const img = new Image();
  img.src = data;
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return tf.browser.fromPixels(canvas);
}

// Provide the path to an image file
estimatePose("./path_to_your_image.jpg");
