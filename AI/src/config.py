"""Single source of truth for paths, column names and training constants."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT.parent / "2-dataset" / "Telco-Customer-Churn.csv"

MODEL_DIR = ROOT / "Model"
BASELINE_DIR = MODEL_DIR / "baselines"
BEST_MODEL_PATH = MODEL_DIR / "best_model.pkl"
METRICS_PATH = MODEL_DIR / "metrics.json"
SCHEMA_PATH = MODEL_DIR / "schema.json"
SAMPLES_PATH = MODEL_DIR / "test_samples.json"

ID_COLUMN = "customerID"
TARGET = "Churn"
POSITIVE_LABEL = "Yes"

NUMERIC_FEATURES = ["tenure", "MonthlyCharges", "TotalCharges"]

# Feature -> UI group. Order here is the order the form renders in.
FEATURE_GROUPS = {
    "Demographics": ["gender", "SeniorCitizen", "Partner", "Dependents"],
    "Services": [
        "PhoneService", "MultipleLines", "InternetService", "OnlineSecurity",
        "OnlineBackup", "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies",
    ],
    "Account": [
        "tenure", "Contract", "PaperlessBilling", "PaymentMethod",
        "MonthlyCharges", "TotalCharges",
    ],
}

FEATURES = [f for group in FEATURE_GROUPS.values() for f in group]
CATEGORICAL_FEATURES = [f for f in FEATURES if f not in NUMERIC_FEATURES]

RANDOM_STATE = 42
TEST_SIZE = 0.2
CV_FOLDS = 5

# Why F1 (on the churn class) and not accuracy:
# only ~26.5% of customers churn, so a model that always answers "No" already
# scores ~73% accuracy while catching zero churners. The business cost is in the
# minority class: a missed churner (false negative) is a lost customer, while a
# false alarm only costs a retention offer. F1 balances recall (catch churners)
# with precision (don't spam everyone), so it is used to pick and tune the model.
# Recall, precision, ROC-AUC and the confusion matrix are reported alongside it.
SELECTION_METRIC = "f1"
