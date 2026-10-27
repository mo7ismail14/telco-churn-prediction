"""Train the 7 required models, pick the best by cross-validated F1, tune it and save everything.

Run:  python train.py
Outputs (in Model/): best_model.pkl, baselines/<model>.pkl, metrics.json, schema.json, test_samples.json
"""
import json
import time

import joblib
from sklearn.model_selection import GridSearchCV, StratifiedKFold, cross_val_score

from src.config import (
    BASELINE_DIR, BEST_MODEL_PATH, CATEGORICAL_FEATURES, CV_FOLDS, FEATURE_GROUPS, ID_COLUMN,
    METRICS_PATH, MODEL_DIR, NUMERIC_FEATURES, RANDOM_STATE, SAMPLES_PATH, SCHEMA_PATH,
    SELECTION_METRIC, TARGET,
)
from src.data import clean, features, load_raw, split, target
from src.evaluate import evaluate
from src.models import MODEL_SPECS, build_pipeline, pipeline_grid

CV = StratifiedKFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_STATE)


def train_baselines(X_train, y_train, X_test, y_test) -> list[dict]:
    results = []
    for key, spec in MODEL_SPECS.items():
        start = time.perf_counter()
        # Selection uses CV on the training set only, so the test set stays unseen.
        cv_score = cross_val_score(build_pipeline(key), X_train, y_train,
                                   scoring=SELECTION_METRIC, cv=CV, n_jobs=-1).mean()
        model = build_pipeline(key).fit(X_train, y_train)
        joblib.dump(model, BASELINE_DIR / f"{key}.pkl", compress=3)
        results.append({"key": key, "name": spec.name, "cv_f1": round(cv_score, 4),
                        **evaluate(model, X_test, y_test)})
        print(f"  {spec.name:<24} cv_f1={cv_score:.4f}  ({time.perf_counter() - start:.1f}s)")
    return results


def tune(key, X_train, y_train):
    search = GridSearchCV(build_pipeline(key), pipeline_grid(key),
                          scoring=SELECTION_METRIC, cv=CV, n_jobs=-1)
    search.fit(X_train, y_train)
    params = {k.removeprefix("classifier__"): v for k, v in search.best_params_.items()}
    return search.best_estimator_, params, search.best_score_


def build_schema(train_df) -> dict:
    def describe(name):
        if name in NUMERIC_FEATURES:
            col = train_df[name]
            return {"name": name, "type": "numeric", "min": float(col.min()),
                    "max": float(col.max()), "default": float(round(col.median(), 2))}
        options = sorted(train_df[name].dropna().unique().tolist())
        return {"name": name, "type": "categorical", "options": options,
                "default": train_df[name].mode()[0]}

    return {"groups": [{"name": group, "features": [describe(f) for f in cols]}
                       for group, cols in FEATURE_GROUPS.items()]}


def build_samples(test_df) -> list[dict]:
    return [{"customerID": row[ID_COLUMN],
             "features": {f: row[f] for f in NUMERIC_FEATURES + CATEGORICAL_FEATURES},
             "actual": row[TARGET]}
            for row in test_df.to_dict(orient="records")]


def write_json(path, data):
    path.write_text(json.dumps(data, indent=2, default=float), encoding="utf-8")


def print_table(results):
    print(f"\n  {'Model':<24}{'CV F1':>8}{'Acc':>8}{'Prec':>8}{'Recall':>8}{'F1':>8}{'AUC':>8}")
    for r in results:
        print(f"  {r['name']:<24}{r['cv_f1']:>8.4f}{r['accuracy']:>8.4f}{r['precision']:>8.4f}"
              f"{r['recall']:>8.4f}{r['f1']:>8.4f}{r['roc_auc']:>8.4f}")


def main():
    BASELINE_DIR.mkdir(parents=True, exist_ok=True)

    df = clean(load_raw())
    train_df, test_df = split(df)
    X_train, y_train = features(train_df), target(train_df)
    X_test, y_test = features(test_df), target(test_df)
    print(f"Rows: {len(df)} | train {len(train_df)} | test {len(test_df)} | churn rate {y_train.mean():.1%}")

    print("\nStep 2 - baseline models:")
    results = train_baselines(X_train, y_train, X_test, y_test)
    print_table(results)

    best = max(results, key=lambda r: r["cv_f1"])
    print(f"\nStep 3 - tuning {best['name']} with GridSearchCV ...")
    tuned_model, params, tuned_cv = tune(best["key"], X_train, y_train)
    tuned_metrics = evaluate(tuned_model, X_test, y_test)
    print(f"  best params: {params}")
    print_table([{"name": f"{best['name']} (tuned)", "cv_f1": tuned_cv, **tuned_metrics}])

    joblib.dump(tuned_model, BEST_MODEL_PATH, compress=3)
    write_json(METRICS_PATH, {
        "selection_metric": SELECTION_METRIC,
        "test_size": len(test_df),
        "churn_rate": round(float(y_train.mean()), 4),
        "baselines": results,
        "best": {"key": best["key"], "name": best["name"], "params": params,
                 "cv_f1": round(tuned_cv, 4), **tuned_metrics},
    })
    write_json(SCHEMA_PATH, build_schema(train_df))
    write_json(SAMPLES_PATH, build_samples(test_df))
    print(f"\nStep 4 - saved artifacts to {MODEL_DIR}")


if __name__ == "__main__":
    main()
