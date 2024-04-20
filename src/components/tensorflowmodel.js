import * as tf from "@tensorflow/tfjs";

function TensorFlowModel() {
  const loadModel = async () => {
    const model = await tf.loadLayersModel("/path/to/model.json");
    console.log("Model loaded");
    return model;
  };

  const runPrediction = async (inputData) => {
    const model = await loadModel();
    const prediction = model.predict(inputData);
    prediction.print();
  };

  return (
    <div>
      <button onClick={() => runPrediction(tf.tensor2d([1, 2, 3, 4], [1, 4]))}>
        Predict
      </button>
    </div>
  );
}

export default TensorFlowModel;
