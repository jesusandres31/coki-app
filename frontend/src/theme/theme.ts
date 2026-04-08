import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FFAA05",
    },
    secondary: {
      main: "#001534",
    },
    info: {
      main: "#50aaff",
    },
    warning: {
      main: "#ffa10a",
    },
    error: {
      main: "#fc3535",
    },
    success: {
      main: "#5faf69",
    },
    text: {
      primary: "#050505",
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 5,
  },
  typography: {
    fontFamily: ["Inter", "sans-serif"].join(","),
    fontSize: 12.5,
  },
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "text.secondary",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          color: "white",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(3px)",
          backgroundColor: "rgba(0,0,30,0.4)",
        },
      },
    },
  },
});

export default theme;
