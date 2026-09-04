import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline"; 
import 'katex/dist/katex.min.css';

// Import Lexend - for Headings use
import "@fontsource/lexend/500.css";
import "@fontsource/lexend/600.css";
import "@fontsource/lexend/700.css";

// Import Quicksand - for Body Text / Normal Words use
import "@fontsource/quicksand/400.css";
import "@fontsource/quicksand/500.css";
import "@fontsource/quicksand/600.css";
import "@fontsource/quicksand/700.css";

import AppRoutes from "./routes/AppRoutes";

// Define heading style once
const headingStyle = { fontFamily: '"Lexend", sans-serif' };

// map style to all header variants
const headingVariants = ["h1", "h2", "h3", "h4", "h5", "h6"].reduce((acc, variant) => {
  acc[variant] = headingStyle;
  return acc;
}, {});

const theme = createTheme({
  typography: {
    // Default font for all normal text, buttons, and tabs
    fontFamily: '"Quicksand", "Roboto", "Helvetica", "Arial", sans-serif',
    
    // Spread operator injects all 6 heading styles 
    ...headingVariants,
  },
  palette: {
    primary: {
      main: "#3855c0", 
    },
    background: {
      default: "#f9fbfd", 
    }
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;