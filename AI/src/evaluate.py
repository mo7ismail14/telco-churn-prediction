"""Metrics used to compare models."""
from sklearn.metrics import (
    accuracy_score, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score,
)


def evaluate(model, X, y) -> dict:
    y_pred = model.predict(X)
    y_proba = model.predict_proba(X)[:, 1]
    return {
        "accuracy": round(accuracy_score(y, y_pred), 4),
        "precision": round(precision_score(y, y_pred), 4),
        "recall": round(recall_score(y, y_pred), 4),
        "f1": round(f1_score(y, y_pred), 4),
        "roc_auc": round(roc_auc_score(y, y_proba), 4),
        # [[TN, FP], [FN, TP]]
        "confusion_matrix": confusion_matrix(y, y_pred).tolist(),
    }
