import { Box, Typography } from "@mui/material";

const CELLS = [
  { label: "True Negative", hint: "Stayed · predicted stay", good: true },
  { label: "False Positive", hint: "Stayed · predicted churn", good: false },
  { label: "False Negative", hint: "Churned · predicted stay", good: false },
  { label: "True Positive", hint: "Churned · predicted churn", good: true },
];

export default function ConfusionMatrix({ matrix }) {
  const values = matrix.flat();
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
      {CELLS.map((c, i) => (
        <Box key={c.label} sx={{ p: 2, borderRadius: 2, textAlign: "center",
          bgcolor: c.good ? "rgba(0,200,83,0.15)" : "rgba(255,82,82,0.15)",
          border: `1px solid ${c.good ? "rgba(0,200,83,0.4)" : "rgba(255,82,82,0.4)"}` }}>
          <Typography variant="h4">{values[i]}</Typography>
          <Typography sx={{ fontWeight: 600 }}>{c.label}</Typography>
          <Typography variant="caption" color="text.secondary">{c.hint}</Typography>
        </Box>
      ))}
    </Box>
  );
}
