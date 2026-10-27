import { Alert, Box, CircularProgress } from "@mui/material";

/** Renders a spinner or error for a useApi() state, otherwise its children. */
export default function Status({ loading, error, children }) {
  if (loading)
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">Could not reach the AI API: {error}</Alert>;
  return children;
}
