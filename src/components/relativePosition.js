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
    return (pose_obj.keypoints[5].score > minConfidence && pose_obj.keypoints[6].score > minConfidence)
};

export { centralizePoints, shoulderInFrame };