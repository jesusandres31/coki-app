import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    // vite
    // primary: {
    //   main: "#747BFF",
    // },
    // secondary: {
    //   main: "#FFCE25",
    // },
    primary: {
      main: "#FFAA05",
      // 303030 black
      // FF9900 amazon orange
      // e26544 beerboard
      // f37a48 mandarin orange
      // 0072bb french deep blue
    },
    secondary: {
      main: "#001534",
      // 481449 slack
      // 303030 black
      // 252F3E amazon blue
      // f6a92c beerboard
    },
    info: {
      main: "#50aaff",
    },
    warning: {
      main: "#ffa726",
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
    borderRadius: 3,
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
