"""The 7 required classifiers, their tuning grids and the shared preprocessing."""
from dataclasses import dataclass
from typing import Callable

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import AdaBoostClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier

from .config import CATEGORICAL_FEATURES, NUMERIC_FEATURES, RANDOM_STATE


@dataclass(frozen=True)
class ModelSpec:
    name: str
    build: Callable
    param_grid: dict


MODEL_SPECS = {
    "logistic_regression": ModelSpec(
        "Logistic Regression",
        lambda: LogisticRegression(max_iter=2000),
        {"C": [0.01, 0.1, 1, 10], "class_weight": [None, "balanced"]},
    ),
    "svm": ModelSpec(
        "Support Vector Machine",
        lambda: SVC(probability=True, random_state=RANDOM_STATE),
        {"C": [0.1, 1, 10], "gamma": ["scale", 0.01], "class_weight": [None, "balanced"]},
    ),
    "knn": ModelSpec(
        "K-Nearest Neighbors",
        lambda: KNeighborsClassifier(),
        {"n_neighbors": [5, 11, 21, 31, 51], "weights": ["uniform", "distance"]},
    ),
    "decision_tree": ModelSpec(
        "Decision Tree",
        lambda: DecisionTreeClassifier(random_state=RANDOM_STATE),
        {"max_depth": [3, 5, 7, None], "min_samples_leaf": [1, 10, 30], "class_weight": [None, "balanced"]},
    ),
    "random_forest": ModelSpec(
        "Random Forest",
        lambda: RandomForestClassifier(random_state=RANDOM_STATE, n_jobs=-1),
        {"n_estimators": [200, 400], "max_depth": [6, 10, None], "min_samples_leaf": [1, 5],
         "class_weight": [None, "balanced"]},
    ),
    "adaboost": ModelSpec(
        "AdaBoost",
        lambda: AdaBoostClassifier(random_state=RANDOM_STATE),
        {"n_estimators": [50, 100, 200, 400], "learning_rate": [0.05, 0.1, 0.5, 1.0]},
    ),
    "xgboost": ModelSpec(
        "XGBoost",
        lambda: XGBClassifier(eval_metric="logloss", random_state=RANDOM_STATE, n_jobs=-1),
        {"n_estimators": [200, 400], "max_depth": [3, 4, 6], "learning_rate": [0.03, 0.1],
         "scale_pos_weight": [1, 2.8]},  # 2.8 ~= stayers / churners
    ),
}


def build_preprocessor() -> ColumnTransformer:
    numeric = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    categorical = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore")),
    ])
    return ColumnTransformer([
        ("num", numeric, NUMERIC_FEATURES),
        ("cat", categorical, CATEGORICAL_FEATURES),
    ])


def build_pipeline(key: str) -> Pipeline:
    return Pipeline([
        ("preprocessor", build_preprocessor()),
        ("classifier", MODEL_SPECS[key].build()),
    ])


def pipeline_grid(key: str) -> dict:
    return {f"classifier__{k}": v for k, v in MODEL_SPECS[key].param_grid.items()}
