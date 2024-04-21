# import csv
# import cv2
# import itertools
# import numpy as np
# import pandas as pd
import os
import sys
import json
# import tempfile
# import tqdm

# from matplotlib import pyplot as plt
# from matplotlib.collections import LineCollection

import tensorflow as tf
from pathlib import Path
# import tensorflow_hub as hub
# from tensorflow import keras

# from sklearn.model_selection import train_test_split
# from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

pose_sample_rpi_path = os.path.join(os.getcwd(), 'examples/lite/examples/pose_estimation/raspberry_pi')
sys.path.append(pose_sample_rpi_path)

from data import BodyPart
from ml import Movenet
movenet = Movenet('movenet_thunder')

def detect(input_tensor, inference_count=3):
    """Runs detection on an input image.

    Args:
    input_tensor: A [height, width, 3] Tensor of type tf.float32.
        Note that height and width can be anything since the image will be
        immediately resized according to the needs of the model within this
        function.
    inference_count: Number of times the model should run repeatly on the
        same input image to improve detection accuracy.

    Returns:
    A Person entity detected by the MoveNet.SinglePose.
    """
    image_height, image_width, channel = input_tensor.shape

    # Detect pose using the full input image
    movenet.detect(input_tensor.numpy(), reset_crop_region=True)

    # Repeatedly using previous detection result to identify the region of
    # interest and only croping that region to improve detection accuracy
    for _ in range(inference_count - 1):
        person = movenet.detect(input_tensor.numpy(), 
                            reset_crop_region=False)

    return person

ypt_dir = Path("./training/yoga_poses/train/chair")
all_poses = dict()

for yoga_pose in ypt_dir.iterdir():
    image = tf.io.read_file(str(yoga_pose.absolute()))
    image = tf.io.decode_png(image)

    person = detect(image)
    person_coords = dict()
    for keypoint in person.keypoints:
        person_coords[keypoint.body_part.name] = dict()
        person_coords[keypoint.body_part.name]["coordinates"] = dict()
        person_coords[keypoint.body_part.name]["coordinates"]["x"] = str(keypoint.coordinate.x)
        person_coords[keypoint.body_part.name]["coordinates"]["y"] = str(keypoint.coordinate.y)
        person_coords[keypoint.body_part.name]["score"] = str(keypoint.score)

    all_poses[yoga_pose.name] = person_coords

print(all_poses)
write_file = Path("./training/pose_data.txt").open('w')
write_file.write(str(json.dumps(all_poses)))