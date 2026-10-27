import { Paper, Typography } from "@mui/material";
import AnimatedNumber from "./AnimatedNumber";
import { gradients } from "../theme";

export default function StatCard({ label, value, hint }) {
  return (
    <Paper sx={{ p: 3, height: "100%", textAlign: "center", transition: "transform .2s",
                 "&:hover": { transform: "translateY(-4px)" } }}>
      <Typography variant="h3" sx={{ background: gradients.brand, WebkitBackgroundClip: "text",
                                     WebkitTextFillColor: "transparent" }}>
        <AnimatedNumber value={value} />
      </Typography>
      <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
      {hint && <Typography variant="body2" color="text.secondary">{hint}</Typography>}
    </Paper>
  );
}
