# Telco Customer Churn Prediction

| Part | Folder | Live |
|---|---|---|
| AI API (Flask) | `AI/` | https://telco-churn-api.vercel.app |
| Frontend (React + MUI) | `frontend/` | https://telco-churn-ui.vercel.app |

## Project structure

```
AI/
  src/config.py      paths, feature lists, metric justification
  src/data.py        load + clean + split (shared by training and the API)
  src/models.py      the 7 models, their tuning grids, preprocessing pipeline
  src/evaluate.py    accuracy / precision / recall / F1 / ROC-AUC / confusion matrix
  src/predictor.py   loads saved models and serves predictions
  train.py           trains all 7, picks best by CV F1, tunes it, saves Model/
  app.py             Flask REST API
frontend/src/
  api/client.js      API calls (URL from .env.development / .env.production)
  components/        reusable UI pieces
  pages/             Home, Predict, Models
```

## Run locally

```bash
# 1) AI API -> http://localhost:5000
cd AI
pip install -r requirements.txt
python train.py        # optional: retrain and regenerate Model/
python app.py

# 2) Frontend -> http://localhost:5173 (uses http://localhost:5000 automatically)
cd frontend
npm install
npm run dev
```

## API

| Method | Route | Body / query |
|---|---|---|
| GET | `/api/health` | |
| GET | `/api/schema` | form fields and options |
| GET | `/api/metrics` | all model metrics + tuned best model |
| GET | `/api/models` | available model keys |
| GET | `/api/samples/random` | `?actual=Yes\|No` random real test-set customer |
| POST | `/api/predict` | `{ customer, model: "best"\|"xgboost"\|..., customerID? }` |
| POST | `/api/predict/all` | `{ customer, customerID? }` |

## Deploy (two separate Vercel projects)

```bash
cd AI && vercel deploy --prod          # project: telco-churn-api
cd frontend && vercel deploy --prod    # project: telco-churn-ui
```

The frontend reads the API URL from `frontend/.env.production`. Set `ALLOWED_ORIGINS` on the API
project to restrict CORS (default `*`).
