import { createTheme } from "@mui/material/styles";

export const gradients = {
  brand: "linear-gradient(135deg, #7C4DFF 0%, #00E5FF 100%)",
  churn: "linear-gradient(90deg, #FF5252, #FF8A65)",
  stay: "linear-gradient(90deg, #00C853, #64FFDA)",
};

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7C4DFF" },
    secondary: { main: "#00E5FF" },
    success: { main: "#00C853" },
    error: { main: "#FF5252" },
    background: { default: "#0B0E1A", paper: "#131829" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none", border: "1px solid rgba(255,255,255,0.07)" },
      },
    },
    MuiButton: { styleOverrides: { root: { borderRadius: 12, paddingInline: 20 } } },
  },
});

export default theme;
