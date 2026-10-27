import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import HomeRounded from "@mui/icons-material/HomeRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import LeaderboardRounded from "@mui/icons-material/LeaderboardRounded";
import { Link, useLocation } from "react-router-dom";
import { gradients } from "../theme";

const NAV = [
  { to: "/", label: "Home", icon: <HomeRounded /> },
  { to: "/predict", label: "Predict", icon: <InsightsRounded /> },
  { to: "/models", label: "Models", icon: <LeaderboardRounded /> },
];

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const current = NAV.some((n) => n.to === pathname) ? pathname : false;

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="sticky" elevation={0}
        sx={{ bgcolor: "rgba(11,14,26,0.75)", backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, flexWrap: "wrap" }}>
            <Typography component={Link} to="/" variant="h6"
              sx={{ fontWeight: 800, textDecoration: "none", background: gradients.brand,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", flexGrow: 1 }}>
              📡 ChurnSight
            </Typography>
            <Tabs value={current} textColor="inherit" variant="scrollable"
              slotProps={{ indicator: { sx: { height: 3, borderRadius: 2, background: gradients.brand } } }}>
              {NAV.map((n) => (
                <Tab key={n.to} value={n.to} label={n.label} icon={n.icon} iconPosition="start"
                  component={Link} to={n.to} sx={{ minHeight: 64 }} />
              ))}
            </Tabs>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, flexGrow: 1 }}>{children}</Container>

      <Box component="footer" sx={{ py: 3, textAlign: "center", color: "text.secondary", fontSize: 14 }}>
        Telco Customer Churn Prediction · Flask + scikit-learn + React
      </Box>
    </Box>
  );
}
