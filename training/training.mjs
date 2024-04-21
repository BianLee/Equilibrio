import * as posenet from "@tensorflow-models/posenet";
import path from 'node:path';
import fs from 'node:fs';
import { createCanvas, Image } from 'canvas'; // Import from node-canvas

async function poseDetectionFrame(image) {
    const net = await posenet.load();
    const static_pose = await net.estimateSinglePose(image, {
        flipHorizontal: false
    });
    import("../components/relativePosition.js").then(relativePosition => {
      const relative_pose = relativePosition.centralizePoints(JSON.parse(JSON.stringify(static_pose)));
      return relative_pose;
    })
}

const yoga_folderPath = 'yoga_poses/train/chair';
// chair, cobra, dog, tree, warrior
const yoga_files = (fs.readdirSync(yoga_folderPath).map(fileName => {
  return path.join(yoga_folderPath, fileName);
}));

for (let i=0; i<yoga_files.length; i++) {
  let img = new Image();
  img.src = yoga_files[i];
  let i_pose = await poseDetectionFrame(img);
  console.log(i_pose);
}