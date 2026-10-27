import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import CleaningServicesRounded from "@mui/icons-material/CleaningServicesRounded";
import ModelTrainingRounded from "@mui/icons-material/ModelTrainingRounded";
import TuneRounded from "@mui/icons-material/TuneRounded";
import BoltRounded from "@mui/icons-material/BoltRounded";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageTransition, { Reveal } from "../components/PageTransition";
import StatCard from "../components/StatCard";
import Status from "../components/Status";
import useApi from "../hooks/useApi";
import { api } from "../api/client";
import { gradients } from "../theme";

const STEPS = [
  { icon: <CleaningServicesRounded />, title: "Clean the data",
    text: "Strip hidden spaces, fix blank TotalCharges, one-hot encode categories and scale numbers." },
  { icon: <ModelTrainingRounded />, title: "Train 7 algorithms",
    text: "Logistic Regression, SVM, KNN, Decision Tree, Random Forest, AdaBoost and XGBoost." },
  { icon: <TuneRounded />, title: "Tune the winner",
    text: "The best model by cross-validated F1 is tuned with GridSearchCV." },
  { icon: <BoltRounded />, title: "Predict live",
    text: "Flask serves the saved models; React shows churn vs stay probability instantly." },
];

function Blob({ color, top, left, delay }) {
  return (
    <motion.div
      animate={{ y: [0, -30, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 8, repeat: Infinity, delay }}
      style={{ position: "absolute", top, left, width: 320, height: 320, borderRadius: "50%",
               background: color, filter: "blur(90px)", opacity: 0.35, pointerEvents: "none" }}
    />
  );
}

export default function Home() {
  const metrics = useApi(api.metrics);
  const best = metrics.data?.best;

  return (
    <PageTransition>
      <Box sx={{ position: "relative", textAlign: "center", py: { xs: 6, md: 10 } }}>
        <Blob color="#7C4DFF" top="-60px" left="5%" delay={0} />
        <Blob color="#00E5FF" top="40px" left="60%" delay={2} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography variant="overline" color="secondary" sx={{ letterSpacing: 3 }}>
            Machine Learning · Telco Customer Churn
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: 38, md: 60 }, mt: 1 }}>
            Know who is leaving{" "}
            <Box component="span" sx={{ background: gradients.brand, WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent" }}>
              before they leave
            </Box>
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 640, mx: "auto", mt: 2, fontSize: 18 }}>
            An end-to-end AI system that predicts whether a telecom customer will cancel their
            subscription, so retention teams can act in time.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "center", mt: 4 }}>
            <Button component={Link} to="/predict" size="large" variant="contained"
              endIcon={<ArrowForwardRounded />} sx={{ background: gradients.brand }}>
              Try a prediction
            </Button>
            <Button component={Link} to="/models" size="large" variant="outlined" color="secondary">
              Compare the 7 models
            </Button>
          </Stack>
        </motion.div>
      </Box>

      <Status loading={metrics.loading} error={metrics.error}>
        {best && (
          <>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Best model: {best.name} (tuned)
            </Typography>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
              {[
                { label: "Recall", value: best.recall, hint: "of churners caught" },
                { label: "F1-Score", value: best.f1, hint: "selection metric" },
                { label: "Accuracy", value: best.accuracy, hint: "overall correct" },
                { label: "ROC-AUC", value: best.roc_auc, hint: "ranking quality" },
              ].map((s, i) => (
                <Reveal key={s.label} index={i}><StatCard {...s} /></Reveal>
              ))}
            </Box>
          </>
        )}
      </Status>

      <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>How it works</Typography>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
        {STEPS.map((s, i) => (
          <Reveal key={s.title} index={i}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 3, display: "grid", placeItems: "center",
                         background: gradients.brand, mb: 2 }}>
                {s.icon}
              </Box>
              <Typography variant="overline" color="text.secondary">Step {i + 1}</Typography>
              <Typography variant="h6">{s.title}</Typography>
              <Typography color="text.secondary" variant="body2">{s.text}</Typography>
            </Paper>
          </Reveal>
        ))}
      </Box>
    </PageTransition>
  );
}
