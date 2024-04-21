from flask import Flask, request, jsonify
import model

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    input_data = request.get_json(force=True)  # Use force=True to avoid errors if the mimetype is not application/json
    # output = model.predict(input_data['text'])
    output = model.predict("How can I improve my cobra pose?")
    return jsonify(output)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

