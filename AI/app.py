"""Flask REST API for the churn models.

Local:   python app.py            -> http://localhost:5000
Vercel:  `app` is picked up automatically as the serverless entrypoint.
"""
import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from src.predictor import BEST_KEY, ChurnPredictor

app = Flask(__name__)
# Comma-separated list of allowed frontend origins, e.g. "https://churn-ui.vercel.app".
CORS(app, origins=os.getenv("ALLOWED_ORIGINS", "*").split(","))
predictor = ChurnPredictor()


@app.errorhandler(ValueError)
def bad_request(error):
    return jsonify(error=str(error)), 400


@app.get("/")
@app.get("/api/health")
def health():
    return jsonify(status="ok", service="Telco Churn API")


@app.get("/api/schema")
def schema():
    return jsonify(predictor.schema)


@app.get("/api/metrics")
def metrics():
    return jsonify(predictor.metrics)


@app.get("/api/models")
def models():
    return jsonify(predictor.model_options())


@app.get("/api/samples/random")
def random_sample():
    actual = request.args.get("actual")  # "Yes" | "No" | None
    return jsonify(predictor.random_sample(actual if actual in ("Yes", "No") else None))


@app.post("/api/predict")
def predict():
    body = request.get_json(silent=True) or {}
    return jsonify(predictor.predict(body.get("customer") or {}, body.get("model", BEST_KEY),
                                     body.get("customerID")))


@app.post("/api/predict/all")
def predict_all():
    body = request.get_json(silent=True) or {}
    return jsonify(predictor.predict_all(body.get("customer") or {}, body.get("customerID")))


if __name__ == "__main__":
    app.run(port=int(os.getenv("PORT", 5000)), debug=True)
