import { LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography } from "@mui/material";
import { CorrectChip, LabelChip } from "./OutcomeChips";
import { gradients } from "../theme";
import { pct } from "../utils/format";

export default function CompareTable({ results }) {
  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" sx={{ p: 2, pb: 0 }}>All models on this customer</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Model</TableCell>
            <TableCell sx={{ minWidth: 160 }}>Churn probability</TableCell>
            <TableCell>Predicted</TableCell>
            <TableCell>Actual</TableCell>
            <TableCell>Correct</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((r) => (
            <TableRow key={r.model.key} hover>
              <TableCell sx={{ fontWeight: r.model.key === "best" ? 700 : 400 }}>{r.model.name}</TableCell>
              <TableCell>
                {pct(r.churn_probability)}
                <LinearProgress variant="determinate" value={r.churn_probability * 100}
                  sx={{ mt: 0.5, height: 6, borderRadius: 3, bgcolor: "rgba(255,255,255,0.08)",
                        "& .MuiLinearProgress-bar": { background: gradients.churn } }} />
              </TableCell>
              <TableCell><LabelChip value={r.prediction} /></TableCell>
              <TableCell><LabelChip value={r.actual} /></TableCell>
              <TableCell><CorrectChip correct={r.correct} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
