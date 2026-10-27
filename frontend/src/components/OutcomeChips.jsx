import { Chip } from "@mui/material";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import CancelRounded from "@mui/icons-material/CancelRounded";

const churnLabel = (v) => (v === "Yes" ? "Churn (leaves)" : "No churn (stays)");

export function LabelChip({ value, unknownText = "Unknown" }) {
  if (!value) return <Chip label={unknownText} variant="outlined" size="small" />;
  return <Chip label={churnLabel(value)} color={value === "Yes" ? "error" : "success"} size="small" />;
}

export function CorrectChip({ correct }) {
  if (correct === null || correct === undefined) return <Chip label="N/A" variant="outlined" size="small" />;
  return correct ? (
    <Chip icon={<CheckCircleRounded />} label="True" color="success" size="small" />
  ) : (
    <Chip icon={<CancelRounded />} label="False" color="error" size="small" />
  );
}
