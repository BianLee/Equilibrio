const centralizePoints = ( pose_obj ) => {
    const nose_yx = pose_obj["keypoints"][0]["position"];
    const nose_y = nose_yx["y"];
    const nose_x = nose_yx["x"];

    for (let body_i = 0; body_i < Object.keys(pose_obj["keypoints"]).length; body_i++) {
        pose_obj["keypoints"][body_i]["position"]["y"] = nose_y - pose_obj["keypoints"][body_i]["position"]["y"];
        pose_obj["keypoints"][body_i]["position"]["x"] = pose_obj["keypoints"][body_i]["position"]["x"] - nose_x;
    }

    return pose_obj;
};

const shoulderInFrame = ( pose_obj ) => {
    return (pose_obj["keypoints"][5]["score"] > 0.6 && pose_obj["keypoints"][6]["score"] > 0.6)
};

export { centralizePoints, shoulderInFrame };