import os
import pandas as pd
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.utils import to_categorical
import json

# Constants
DATA_FOLDER = './'
POSE_CLASSES = ['chair', 'cobra', 'dog', 'tree', 'warrior']
MODEL_FILENAME = 'yoga_pose_model.h5'

def load_data(pose_class):
    filepath = os.path.join(DATA_FOLDER, f'{pose_class}_data.txt')
    with open(filepath, 'r') as file:
        data = json.load(file)
    df = json_to_dataframe(data)
    df['label'] = pose_class
    return df

def json_to_dataframe(data):
    # Conversion code from previous steps...
    # ...
    return pd.DataFrame(rows)

def prepare_dataset():
    frames = [load_data(pose_class) for pose_class in POSE_CLASSES]
    full_df = pd.concat(frames, ignore_index=True)
    
    # Convert labels to categorical
    full_df['label'] = pd.Categorical(full_df['label'])
    full_df['label'] = full_df['label'].cat.codes
    
    # Split data...
    # Feature engineering...
    
    return X_train, X_val, X_test, y_train, y_val, y_test

def build_model(input_shape, num_classes):
    model = Sequential([
        Dense(64, activation='relu', input_shape=input_shape),
        Dense(32, activation='relu'),
        Dense(num_classes, activation='softmax')
    ])
    
    model.compile(optimizer='adam',
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])
    return model

def main():
    X_train, X_val, X_test, y_train, y_val, y_test = prepare_dataset()
    
    # Assuming one-hot encoding for the categorical labels
    y_train_encoded = to_categorical(y_train)
    y_val_encoded = to_categorical(y_val)
    
    model = build_model((X_train.shape[1],), len(POSE_CLASSES))
    
    model.fit(X_train, y_train_encoded, epochs=10, validation_data=(X_val, y_val_encoded))
    
    test_loss, test_acc = model.evaluate(X_test, to_categorical(y_test))
    print(f'Test accuracy: {test_acc}')
    
    model.save(MODEL_FILENAME)

if __name__ == '__main__':
    main()
