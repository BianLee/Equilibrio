const centralizePoints = ( pose_obj ) => {
    const nose_y = pose_obj.keypoints[0].position.y;
    const nose_x = pose_obj.keypoints[0].position.x;

    const left_shoulder = pose_obj.keypoints[5].position;
    const lsx = left_shoulder.x; const lsy = left_shoulder.y;
    const right_shoulder = pose_obj.keypoints[6].position;
    const rsx = right_shoulder.x; const rsy = right_shoulder.y;

    const shoulder_dist = ((lsx - rsx) ** 2 + (lsy - rsy) ** 2) ** 0.5;

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
    const lsx = left_shoulder.x; const lsy = left_shoulder.y;
    const right_shoulder = pose_obj.keypoints[6].position;
    const rsx = right_shoulder.x; const rsy = right_shoulder.y;

    const shoulder_dist = ((lsx - rsx) ** 2 + (lsy - rsy) ** 2) ** 0.5;

    let leftKneeXY = pose_obj.keypoints[13].position;
    let rightKneeXY = pose_obj.keypoints[14].position;

    if (Math.abs(leftKneeXY.x - rightKneeXY.x) < (shoulder_dist/1.5)) {
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
    const lsx = left_shoulder.x; const lsy = left_shoulder.y;
    const right_shoulder = pose_obj.keypoints[6].position;
    const rsx = right_shoulder.x; const rsy = right_shoulder.y;

    const shoulder_dist = ((lsx - rsx) ** 2 + (lsy - rsy) ** 2) ** 0.5;

    let leftElbowXY = pose_obj.keypoints[7].position;
    let rightElbowXY = pose_obj.keypoints[8].position;

    if (Math.abs(rightElbowXY.x - rsx) < (shoulder_dist/2) && Math.abs(leftElbowXY.x - lsx) < (shoulder_dist/2) && 
        Math.abs(rightElbowXY.y - rsy) > (shoulder_dist/2) && Math.abs(leftElbowXY.y - lsy) > (shoulder_dist/2)) {
        return true;
    } else {
        return false;
    }
}

export { centralizePoints, shoulderInFrame, handsAboveHead, kneesTogether, armsStraight };