from flask import Flask, request, jsonify
from processreceipt import extract_text, classify_text
import tempfile
import os

from flask_cors import CORS


app = Flask(__name__)
CORS(app)


@app.route("/classify", methods=["POST"])
def classify_receipt():
    if 'file' not in request.files:
        print("No file in request")
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        print("Empty file received")
        return jsonify({"error": "Empty file"}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
        file.save(tmp.name)
        try:
            text = extract_text(tmp.name)
            print("OCR Output:", text)
            result = classify_text(text, os.getenv("OPENROUTER_API_KEY"))
            print("LLM Output:", result)
            return jsonify({"result": result})
        except Exception as e:
            print("Error in classification:", str(e))
            return jsonify({"error": str(e)}), 500
        finally:
            os.remove(tmp.name)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5500)