import { min } from "@tensorflow/tfjs";

const centralizePoints = ( pose_obj ) => {
    const nose_y = pose_obj.keypoints[0].position.y;
    const nose_x = pose_obj.keypoints[0].position.x;

    const left_shoulder = pose_obj.keypoints[5].position;
    const right_shoulder = pose_obj.keypoints[6].position;

    const shoulder_dist = distance_formula(left_shoulder, right_shoulder);

    for (let body_i = 0; body_i < Object.keys(pose_obj["keypoints"]).length; body_i++) {
        pose_obj.keypoints[body_i].position.y = (nose_y - pose_obj.keypoints[body_i].position.y) / shoulder_dist;
        pose_obj.keypoints[body_i].position.x = (pose_obj.keypoints[body_i].position.x - nose_x) / shoulder_dist;
    }

    return pose_obj;
};

const shoulderInFrame = ( pose_obj, minConfidence ) => {
    return (pose_obj.keypoints[5].score > minConfidence && pose_obj.keypoints[6].score > minConfidence);
};

const handsAboveHead = ( pose_obj, minConfidence ) => {
    let handsInFrame = (pose_obj.keypoints[9].score > minConfidence && pose_obj.keypoints[10].score);
    if (!handsInFrame) {
        return false;
    }

    let noseXY = pose_obj.keypoints[0].position;

    let leftWristXY = pose_obj.keypoints[9].position;
    let rightWristXY = pose_obj.keypoints[10].position;

    if (leftWristXY.y > noseXY.y && rightWristXY.y > noseXY.y) {
        return true;
    } else {
        return false;
    }
}

const kneesTogether = ( pose_obj, minConfidence ) => {
    let kneesInFrame = (pose_obj.keypoints[13].score > minConfidence && pose_obj.keypoints[14].score > minConfidence);
    if (!kneesInFrame) {
        return false;
    }

    const left_shoulder = pose_obj.keypoints[5].position;
    const right_shoulder = pose_obj.keypoints[6].position;

    const shoulder_dist = distance_formula(left_shoulder, right_shoulder);

    let leftKneeXY = pose_obj.keypoints[13].position;
    let rightKneeXY = pose_obj.keypoints[14].position;

    if (Math.abs(leftKneeXY.x - rightKneeXY.x) < (shoulder_dist)) {
        return true;
    } else {
        return false;
    }
}

const armsStraight = ( pose_obj, minConfidence ) => {
    let armsInFrame = (pose_obj.keypoints[7].score > minConfidence && pose_obj.keypoints[8].score > minConfidence);
    if (!armsInFrame) {
        return false;
    }

    const left_shoulder = pose_obj.keypoints[5].position;
    const right_shoulder = pose_obj.keypoints[6].position;

    const shoulder_dist = distance_formula(left_shoulder, right_shoulder);

    let leftElbowXY = pose_obj.keypoints[7].position;
    let rightElbowXY = pose_obj.keypoints[8].position;

    if (Math.abs(rightElbowXY.x - right_shoulder.x) < (shoulder_dist/2) && Math.abs(leftElbowXY.x - left_shoulder.x) < (shoulder_dist/2) && 
        Math.abs(rightElbowXY.y - right_shoulder.y) > (shoulder_dist/2) && Math.abs(leftElbowXY.y - left_shoulder.y) > (shoulder_dist/2)) {
        return true;
    } else {
        return false;
    }
}

const onAllFours = ( pose_obj, minConfidence ) => {
    let wristsInFrame = (pose_obj.keypoints[9].score > minConfidence && pose_obj.keypoints[10].score > minConfidence);
    let anklesInFrame = (pose_obj.keypoints[15].score > minConfidence && pose_obj.keypoints[16].score > minConfidence);
    
    if (!wristsInFrame || !anklesInFrame) {
        return false;
    }

    const left_shoulder = pose_obj.keypoints[5].position;
    const right_shoulder = pose_obj.keypoints[6].position;

    const shoulder_dist = distance_formula(left_shoulder, right_shoulder);

    let leftWristXY = pose_obj.keypoints[9].position;
    let rightWristXY = pose_obj.keypoints[10].position;
    let leftAnkleXY = pose_obj.keypoints[15].position;
    let rightAnkleXY = pose_obj.keypoints[16].position;

    if (Math.abs(leftWristXY.y - leftAnkleXY.y) < shoulder_dist && Math.abs(rightWristXY.y - rightAnkleXY.y) < shoulder_dist) {
        return true;
    } else {
        return false;
    }
}

const lowerHead = ( pose_obj, minConfidence ) => {
    const earsInFrame = pose_obj.keypoints[3].score > minConfidence && pose_obj.keypoints[4].score > minConfidence;
    const shouldersInFrame = pose_obj.keypoints[5].score > minConfidence && pose_obj.keypoints[6].score > minConfidence;
    if (!earsInFrame || !shouldersInFrame) {
        return false;
    }

    const leftEarXY = pose_obj.keypoints[3].position;
    const rightEarXY = pose_obj.keypoints[4].position;
    const leftShoulderXY = pose_obj.keypoints[5].position;
    const rightShoulderXY = pose_obj.keypoints[6].position;

    if (rightEarXY.y < rightShoulderXY.y && leftEarXY.y < leftShoulderXY.y) {
        return true;
    } else {
        false;
    }
}

const treePose = ( pose_obj, minConfidence ) => {
    let anklesInFrame = (pose_obj.keypoints[15].score > minConfidence && pose_obj.keypoints[16].score > minConfidence);
    let kneesInFrame = (pose_obj.keypoints[13].score > minConfidence && pose_obj.keypoints[14].score > minConfidence);
    if (!anklesInFrame || !kneesInFrame) {
        return false;
    }

    const left_shoulder = pose_obj.keypoints[5].position;
    const right_shoulder = pose_obj.keypoints[6].position;

    const shoulder_dist = distance_formula(left_shoulder, right_shoulder);

    let leftKneeXY = pose_obj.keypoints[13].position;
    let rightKneeXY = pose_obj.keypoints[14].position;
    let leftAnkleXY = pose_obj.keypoints[15].position;
    let rightAnkleXY = pose_obj.keypoints[16].position;

    if (distance_formula(leftKneeXY, rightAnkleXY) < shoulder_dist || distance_formula(rightKneeXY, leftAnkleXY) < shoulder_dist) {
        return true;
    } else {
        return false;
    }
}

const elbowsFlared = ( pose_obj, minConfidence ) => {
    const elbowsInFrame = pose_obj.keypoints[7].score > minConfidence && pose_obj.keypoints[8].score > minConfidence;
    if (!elbowsInFrame) {
        return false;
    }

    const left_shoulder = pose_obj.keypoints[5].position;
    const right_shoulder = pose_obj.keypoints[6].position;

    const shoulder_dist = distance_formula(left_shoulder, right_shoulder);

    const leftElbowXY = pose_obj.keypoints[7].position;
    const rightElbowXY = pose_obj.keypoints[8].position;

    if (Math.abs(leftElbowXY.x - rightElbowXY.x) > (shoulder_dist * 2)) {
        return true;
    } else {
        return false;
    }
}

const distance_formula = (objA, objB) => {
    return ((objA.x - objB.x) ** 2 + (objA.y - objB.y) ** 2) ** 0.5;
}

export { centralizePoints, shoulderInFrame, handsAboveHead, kneesTogether, armsStraight, onAllFours, lowerHead, treePose, elbowsFlared };