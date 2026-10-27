import { Box, Chip, LinearProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography } from "@mui/material";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import PageTransition, { Reveal } from "../components/PageTransition";
import ConfusionMatrix from "../components/ConfusionMatrix";
import StatCard from "../components/StatCard";
import Status from "../components/Status";
import useApi from "../hooks/useApi";
import { api } from "../api/client";
import { gradients } from "../theme";
import { METRICS, pct } from "../utils/format";

function MetricCell({ value, isTop }) {
  return (
    <TableCell sx={{ minWidth: 110 }}>
      <Typography variant="body2" sx={{ fontWeight: isTop ? 800 : 400 }} color={isTop ? "secondary" : "inherit"}>
        {pct(value)}
      </Typography>
      <LinearProgress variant="determinate" value={value * 100}
        sx={{ mt: 0.5, height: 5, borderRadius: 3, bgcolor: "rgba(255,255,255,0.08)",
              "& .MuiLinearProgress-bar": { background: gradients.brand } }} />
    </TableCell>
  );
}

export default function Models() {
  const { data, loading, error } = useApi(api.metrics);

  return (
    <PageTransition>
      <Typography variant="h4">Model comparison</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        All 7 algorithms trained on the same cleaned data and scored on the same unseen test set.
      </Typography>

      <Status loading={loading} error={error}>
        {data && (() => {
          const { baselines, best } = data;
          const top = Object.fromEntries(
            [...METRICS.map((m) => m.key), "cv_f1"].map((k) => [k, Math.max(...baselines.map((b) => b[k]))])
          );
          return (
            <Stack spacing={4}>
              <Paper sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                  <EmojiEventsRounded color="warning" />
                  <Typography variant="h5">{best.name} · tuned with GridSearchCV</Typography>
                </Stack>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", mb: 3 }}>
                  {Object.entries(best.params).map(([k, v]) => (
                    <Chip key={k} label={`${k} = ${v ?? "None"}`} variant="outlined" color="secondary" />
                  ))}
                </Stack>
                <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" } }}>
                  <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" } }}>
                    {METRICS.map((m, i) => (
                      <Reveal key={m.key} index={i}><StatCard label={m.label} value={best[m.key]} /></Reveal>
                    ))}
                    <Reveal index={5}><StatCard label="CV F1" value={best.cv_f1} hint="5-fold, train set" /></Reveal>
                  </Box>
                  <ConfusionMatrix matrix={best.confusion_matrix} />
                </Box>
              </Paper>

              <TableContainer component={Paper}>
                <Typography variant="h6" sx={{ p: 2, pb: 0 }}>Baseline models (default settings)</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Model</TableCell>
                      <TableCell>CV F1</TableCell>
                      {METRICS.map((m) => <TableCell key={m.key}>{m.label}</TableCell>)}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {baselines.map((b) => (
                      <TableRow key={b.key} hover selected={b.key === best.key}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {b.name} {b.key === best.key && <Chip size="small" label="winner" color="warning" sx={{ ml: 1 }} />}
                        </TableCell>
                        <MetricCell value={b.cv_f1} isTop={b.cv_f1 === top.cv_f1} />
                        {METRICS.map((m) => <MetricCell key={m.key} value={b[m.key]} isTop={b[m.key] === top[m.key]} />)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Why F1 & Recall instead of Accuracy?</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Only {pct(data.churn_rate)} of customers churn. A model that always says "stays" would
                  already score about {pct(1 - data.churn_rate, 0)} accuracy while catching zero churners,
                  so accuracy alone is misleading on this imbalanced data.
                </Typography>
                <Typography color="text.secondary">
                  A missed churner (false negative) means a lost customer, while a false alarm only costs a
                  retention offer. So we pick and tune models by <b>F1-score</b> on the churn class, which
                  balances <b>Recall</b> (catching churners) with <b>Precision</b> (not alerting on everyone).
                  Tuning moved recall from {pct(baselines.find((b) => b.key === best.key).recall)} to{" "}
                  {pct(best.recall)} and accuracy from {pct(baselines.find((b) => b.key === best.key).accuracy)} to{" "}
                  {pct(best.accuracy)}.
                </Typography>
              </Paper>
            </Stack>
          );
        })()}
      </Status>
    </PageTransition>
  );
}
