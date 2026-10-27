import { Alert, Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import ProbabilityBars from "./ProbabilityBars";
import { CorrectChip, LabelChip } from "./OutcomeChips";

function Row({ label, children }) {
  return (
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", py: 1 }}>
      <Typography color="text.secondary">{label}</Typography>
      {children}
    </Stack>
  );
}

export default function PredictionResult({ result }) {
  const leaving = result.prediction === "Yes";
  return (
    <motion.div key={`${result.model.key}-${result.churn_probability}`}
      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="overline" color="text.secondary">Prediction by</Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>{result.model.name}</Typography>

        <Alert severity={leaving ? "error" : "success"} variant="filled" sx={{ mb: 3, fontWeight: 600 }}>
          {leaving ? "This customer is at risk of leaving ⚠️" : "This customer is likely to stay ✅"}
        </Alert>

        <ProbabilityBars churn={result.churn_probability} stay={result.stay_probability} />

        <Divider sx={{ my: 2 }} />
        <Box>
          <Row label="Model prediction"><LabelChip value={result.prediction} /></Row>
          <Row label="Actual result"><LabelChip value={result.actual} unknownText="Unknown (new customer)" /></Row>
          <Row label="Was the model right?"><CorrectChip correct={result.correct} /></Row>
        </Box>
      </Paper>
    </motion.div>
  );
}
