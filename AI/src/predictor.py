"""Loads saved artifacts and serves predictions. Models load lazily (fast serverless cold starts)."""
import json
import random
from functools import cached_property, lru_cache

import joblib
import pandas as pd

from .config import BASELINE_DIR, BEST_MODEL_PATH, FEATURES, METRICS_PATH, POSITIVE_LABEL, SAMPLES_PATH, SCHEMA_PATH
from .data import clean_features
from .models import MODEL_SPECS

BEST_KEY = "best"


class ChurnPredictor:
    @cached_property
    def metrics(self) -> dict:
        return json.loads(METRICS_PATH.read_text(encoding="utf-8"))

    @cached_property
    def schema(self) -> dict:
        return json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))

    @cached_property
    def samples(self) -> dict:
        data = json.loads(SAMPLES_PATH.read_text(encoding="utf-8"))
        return {s["customerID"]: s for s in data}

    @cached_property
    def _feature_specs(self) -> dict:
        return {f["name"]: f for g in self.schema["groups"] for f in g["features"]}

    def model_options(self) -> list[dict]:
        best = self.metrics["best"]
        return [{"key": BEST_KEY, "name": f"{best['name']} (tuned)"}] + [
            {"key": k, "name": s.name} for k, s in MODEL_SPECS.items()
        ]

    def random_sample(self, actual: str | None = None) -> dict:
        pool = [s for s in self.samples.values() if actual in (None, s["actual"])]
        return random.choice(pool)

    def predict(self, customer: dict, model_key: str = BEST_KEY, customer_id: str | None = None) -> dict:
        model = _load_model(model_key)
        frame = clean_features(pd.DataFrame([self._validate(customer)]))[FEATURES]
        churn_prob = float(model.predict_proba(frame)[0, 1])
        predicted = POSITIVE_LABEL if churn_prob >= 0.5 else "No"

        result = {
            "model": next(m for m in self.model_options() if m["key"] == model_key),
            "churn_probability": round(churn_prob, 4),
            "stay_probability": round(1 - churn_prob, 4),
            "prediction": predicted,
            "actual": None,
            "correct": None,
        }
        # Actual label is only known for real customers from the held-out test set.
        sample = self.samples.get(customer_id)
        if sample:
            result["actual"] = sample["actual"]
            result["correct"] = sample["actual"] == predicted
        return result

    def predict_all(self, customer: dict, customer_id: str | None = None) -> list[dict]:
        return [self.predict(customer, m["key"], customer_id) for m in self.model_options()]

    def _validate(self, customer: dict) -> dict:
        missing = [f for f in FEATURES if customer.get(f) in (None, "")]
        if missing:
            raise ValueError(f"Missing fields: {', '.join(missing)}")
        for name, spec in self._feature_specs.items():
            value = customer[name]
            if spec["type"] == "categorical" and value not in spec["options"]:
                raise ValueError(f"{name} must be one of {spec['options']}")
            if spec["type"] == "numeric":
                try:
                    if float(value) < 0:
                        raise ValueError
                except (TypeError, ValueError):
                    raise ValueError(f"{name} must be a non-negative number") from None
        return {f: customer[f] for f in FEATURES}


@lru_cache(maxsize=None)
def _load_model(key: str):
    if key == BEST_KEY:
        return joblib.load(BEST_MODEL_PATH)
    if key not in MODEL_SPECS:
        raise ValueError(f"Unknown model '{key}'")
    return joblib.load(BASELINE_DIR / f"{key}.pkl")
