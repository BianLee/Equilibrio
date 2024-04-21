import tensorflow as tf
from tfjs_models import posenet


image_paths = "./yoga_poses/train/chairgirl1_chair070.jpg"

def load_and_preprocess_image(image_path):
    img = tf.io.read_file(image_path)
    img = tf.image.decode_jpeg(img, channels=3)
    img = tf.image.resize(img, [224, 224])  # Resize to the input size required by PoseNet
    img = tf.cast(img, tf.float32) / 255.0  # Normalize pixel values
    return img

# Assuming 'image_paths' is a list of file paths to your images
dataset = tf.data.Dataset.from_tensor_slices(image_paths)
dataset = dataset.map(load_and_preprocess_image)

dataset = tf.data.Dataset.from_tensor_slices(image_paths)
dataset = dataset.map(load_and_preprocess_image)

# Dummy example for extracting features using a loaded PoseNet model
poses = []
for image in dataset:
    pose = posenet.estimate_single_pose(image)  # This function needs to be defined or adapted
    poses.append(pose)

print(poses)
