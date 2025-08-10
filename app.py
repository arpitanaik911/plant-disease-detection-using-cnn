import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from flask import Flask, request, render_template, jsonify
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Load the trained model
model = load_model('model.keras')  # Ensure this matches your model file
print('Model loaded. Check http://127.0.0.1:5000/')

# Define class labels
labels = {0: 'Healthy', 1: 'Powdery', 2: 'Rust'}

# Ensure the uploads directory exists
upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(upload_folder, exist_ok=True)

def getResult(image_path):
    try:
        img = load_img(image_path, target_size=(225, 225))
        x = img_to_array(img)
        x = x.astype('float32') / 255.
        x = np.expand_dims(x, axis=0)
        predictions = model.predict(x)[0]
        print(f"Predictions: {predictions}")
        return predictions
    except Exception as e:
        print(f"Error in getResult: {e}")
        return None

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    f = request.files['file']
    if f.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    file_path = os.path.join(upload_folder, secure_filename(f.filename))
    print(f"Saving file to: {file_path}")  # Debug print statement
    f.save(file_path)
    print(f"File saved at: {file_path}")

    try:
        predictions = getResult(file_path)
        if predictions is None:
            return jsonify({'error': 'Failed to process image'}), 500

        predicted_label = labels[np.argmax(predictions)]
        print(f"Predicted Label: {predicted_label}")
        return jsonify({'prediction': predicted_label})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
