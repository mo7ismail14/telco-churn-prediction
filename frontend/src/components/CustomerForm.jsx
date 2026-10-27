import { useState } from "react";
import { Box, FormControl, InputLabel, MenuItem, Paper, Select, Tab, Tabs, TextField,
  ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { FEATURE_LABELS } from "../utils/format";

function Field({ spec, value, onChange }) {
  const label = FEATURE_LABELS[spec.name] ?? spec.name;

  if (spec.type === "numeric")
    return (
      <TextField fullWidth type="number" label={label} value={value}
        onChange={(e) => onChange(spec.name, e.target.value === "" ? "" : Number(e.target.value))}
        slotProps={{ htmlInput: { min: 0, step: spec.name === "tenure" ? 1 : 0.05 } }} />
    );

  // Short option lists read better as toggles; longer ones as a dropdown.
  if (spec.options.length <= 3)
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{label}</Typography>
        <ToggleButtonGroup exclusive fullWidth size="small" color="primary" value={value}
          onChange={(_, v) => v !== null && onChange(spec.name, v)}>
          {spec.options.map((o) => <ToggleButton key={o} value={o}>{o}</ToggleButton>)}
        </ToggleButtonGroup>
      </Box>
    );

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={(e) => onChange(spec.name, e.target.value)}>
        {spec.options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
      </Select>
    </FormControl>
  );
}

export default function CustomerForm({ schema, values, onChange }) {
  const [tab, setTab] = useState(0);
  const group = schema.groups[tab];

  return (
    <Paper sx={{ overflow: "hidden" }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth"
        sx={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        {schema.groups.map((g) => <Tab key={g.name} label={g.name} />)}
      </Tabs>
      <Box sx={{ p: 3, display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
        {group.features.map((spec) => (
          <Field key={spec.name} spec={spec} value={values[spec.name] ?? ""} onChange={onChange} />
        ))}
      </Box>
    </Paper>
  );
}
