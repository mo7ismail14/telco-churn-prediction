import { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, FormControl, InputLabel, MenuItem, Paper, Select, Stack,
  Typography } from "@mui/material";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import CasinoRounded from "@mui/icons-material/CasinoRounded";
import CompareArrowsRounded from "@mui/icons-material/CompareArrowsRounded";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";
import PageTransition from "../components/PageTransition";
import CustomerForm from "../components/CustomerForm";
import PredictionResult from "../components/PredictionResult";
import CompareTable from "../components/CompareTable";
import Status from "../components/Status";
import useApi from "../hooks/useApi";
import { api } from "../api/client";
import { gradients } from "../theme";

const defaultsFrom = (schema) =>
  Object.fromEntries(schema.groups.flatMap((g) => g.features.map((f) => [f.name, f.default])));

export default function Predict() {
  const schema = useApi(api.schema);
  const models = useApi(api.models);

  const [values, setValues] = useState({});
  const [customerID, setCustomerID] = useState(null); // set only for real test-set customers
  const [algorithm, setAlgorithm] = useState("xgboost");
  const [result, setResult] = useState(null);
  const [compare, setCompare] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (schema.data) setValues(defaultsFrom(schema.data));
  }, [schema.data]);

  const run = async (task) => {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setCompare(null);
  };

  const loadSample = (actual) =>
    run(async () => {
      const sample = await api.randomSample(actual);
      setValues(sample.features);
      setCustomerID(sample.customerID);
      clearResults();
    });

  const reset = () => {
    setValues(defaultsFrom(schema.data));
    setCustomerID(null);
    clearResults();
  };

  // Any edit makes this a new, hypothetical customer whose real outcome is unknown.
  const handleChange = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setCustomerID(null);
  };

  const predictWith = (model) => run(async () => {
    setCompare(null);
    setResult(await api.predict(values, model, customerID));
  });

  const predictAll = () => run(async () => {
    const all = await api.predictAll(values, customerID);
    setResult(all[0]);
    setCompare(all);
  });

  const algorithms = (models.data ?? []).filter((m) => m.key !== "best");

  return (
    <PageTransition>
      <Typography variant="h4">Predict customer churn</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Load a real customer from the unseen test set (actual result known) or fill in your own.
      </Typography>

      <Status loading={schema.loading || models.loading} error={schema.error || models.error}>
        {schema.data && (
          <>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ alignItems: { md: "center" } }}>
                <Button startIcon={<CasinoRounded />} variant="outlined" onClick={() => loadSample()} disabled={busy}>
                  Random customer
                </Button>
                <Button color="error" variant="outlined" onClick={() => loadSample("Yes")} disabled={busy}>
                  Random churner
                </Button>
                <Button color="success" variant="outlined" onClick={() => loadSample("No")} disabled={busy}>
                  Random stayer
                </Button>
                <Button startIcon={<RestartAltRounded />} onClick={reset} disabled={busy}>New customer</Button>
                <Box sx={{ flexGrow: 1 }} />
                {customerID ? (
                  <Chip color="secondary" label={`Real customer ${customerID} · actual result known`} />
                ) : (
                  <Chip variant="outlined" label="Custom customer · actual result unknown" />
                )}
              </Stack>
            </Paper>

            <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" },
                       alignItems: "start" }}>
              <Stack spacing={2}>
                <CustomerForm schema={schema.data} values={values} onChange={handleChange} />

                <Paper sx={{ p: 2.5 }}>
                  <Stack spacing={2}>
                    <Button size="large" variant="contained" startIcon={<AutoAwesomeRounded />}
                      onClick={() => predictWith("best")} disabled={busy} sx={{ background: gradients.brand }}>
                      AI Predict with the best model
                    </Button>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Algorithm</InputLabel>
                        <Select label="Algorithm" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                          {algorithms.map((m) => <MenuItem key={m.key} value={m.key}>{m.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <Button variant="outlined" startIcon={<PlayArrowRounded />} sx={{ flexShrink: 0 }}
                        onClick={() => predictWith(algorithm)} disabled={busy}>
                        Predict with this algorithm
                      </Button>
                    </Stack>
                    <Button variant="text" color="secondary" startIcon={<CompareArrowsRounded />}
                      onClick={predictAll} disabled={busy}>
                      Compare all 7 algorithms + best model
                    </Button>
                  </Stack>
                </Paper>
              </Stack>

              <Box sx={{ position: { md: "sticky" }, top: { md: 90 } }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {result ? (
                  <PredictionResult result={result} />
                ) : (
                  <Paper sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                    <AutoAwesomeRounded sx={{ fontSize: 48, mb: 1, color: "primary.main" }} />
                    <Typography>Pick a customer and press a predict button to see the result.</Typography>
                  </Paper>
                )}
              </Box>
            </Box>

            {compare && <Box sx={{ mt: 3 }}><CompareTable results={compare} /></Box>}
          </>
        )}
      </Status>
    </PageTransition>
  );
}
