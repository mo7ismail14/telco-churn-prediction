export const pct = (value, digits = 1) => `${(value * 100).toFixed(digits)}%`;

export const FEATURE_LABELS = {
  gender: "Gender",
  SeniorCitizen: "Senior Citizen",
  Partner: "Has Partner",
  Dependents: "Has Dependents",
  PhoneService: "Phone Service",
  MultipleLines: "Multiple Lines",
  InternetService: "Internet Service",
  OnlineSecurity: "Online Security",
  OnlineBackup: "Online Backup",
  DeviceProtection: "Device Protection",
  TechSupport: "Tech Support",
  StreamingTV: "Streaming TV",
  StreamingMovies: "Streaming Movies",
  tenure: "Tenure (months)",
  Contract: "Contract",
  PaperlessBilling: "Paperless Billing",
  PaymentMethod: "Payment Method",
  MonthlyCharges: "Monthly Charges ($)",
  TotalCharges: "Total Charges ($)",
};

export const METRICS = [
  { key: "accuracy", label: "Accuracy" },
  { key: "precision", label: "Precision" },
  { key: "recall", label: "Recall" },
  { key: "f1", label: "F1-Score" },
  { key: "roc_auc", label: "ROC-AUC" },
];
