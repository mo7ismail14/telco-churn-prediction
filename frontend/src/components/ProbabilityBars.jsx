import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import AnimatedNumber from "./AnimatedNumber";
import { gradients } from "../theme";

function Bar({ label, value, gradient }) {
  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
        <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
        <Typography sx={{ fontWeight: 700 }}><AnimatedNumber value={value} /></Typography>
      </Stack>
      <LinearProgress variant="determinate" value={value * 100}
        sx={{ height: 14, borderRadius: 7, bgcolor: "rgba(255,255,255,0.08)",
              "& .MuiLinearProgress-bar": { borderRadius: 7, background: gradient } }} />
    </Box>
  );
}

export default function ProbabilityBars({ churn, stay }) {
  return (
    <Stack spacing={2}>
      <Bar label="⚠️ Will leave the company" value={churn} gradient={gradients.churn} />
      <Bar label="✅ Will stay with the company" value={stay} gradient={gradients.stay} />
    </Stack>
  );
}
