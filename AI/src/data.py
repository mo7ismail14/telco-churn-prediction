"""Loading, cleaning and splitting the Telco churn data."""
import pandas as pd
from sklearn.model_selection import train_test_split

from .config import (
    DATA_PATH, FEATURES, ID_COLUMN, NUMERIC_FEATURES, POSITIVE_LABEL,
    RANDOM_STATE, TARGET, TEST_SIZE,
)


def load_raw(path=DATA_PATH) -> pd.DataFrame:
    return pd.read_csv(path)


def clean_features(df: pd.DataFrame) -> pd.DataFrame:
    """Cleaning shared by training and live prediction, so both see identical inputs."""
    df = df.copy()
    df.columns = df.columns.str.strip()

    for col in df.columns:
        if pd.api.types.is_string_dtype(df[col]) or df[col].dtype == object:
            # Hidden spaces: " " in TotalCharges is a blank, not a value.
            df[col] = df[col].astype(str).str.strip().replace({"": None, "nan": None})

    for col in NUMERIC_FEATURES:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # The only blank TotalCharges belong to tenure == 0 customers who have not
    # been billed yet, so their true total is 0 (not the median).
    df.loc[df["TotalCharges"].isna() & (df["tenure"] == 0), "TotalCharges"] = 0.0

    # SeniorCitizen is a 0/1 flag; make it Yes/No like every other binary column.
    df["SeniorCitizen"] = df["SeniorCitizen"].astype(str).replace({"0": "No", "1": "Yes"})
    return df


def clean(df: pd.DataFrame) -> pd.DataFrame:
    df = clean_features(df)
    return df.drop_duplicates(subset=ID_COLUMN).dropna(subset=[TARGET]).reset_index(drop=True)


def split(df: pd.DataFrame):
    """Stratified split so train and test keep the same churn ratio."""
    return train_test_split(
        df, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=df[TARGET]
    )


def features(df: pd.DataFrame) -> pd.DataFrame:
    return df[FEATURES]


def target(df: pd.DataFrame) -> pd.Series:
    return (df[TARGET] == POSITIVE_LABEL).astype(int)
