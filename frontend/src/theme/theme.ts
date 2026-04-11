import { alpha, createTheme } from "@mui/material";

const github = {
  fgDefault: "#1F2328",
  fgMuted: "#57606A",
  fgSubtle: "#656D76",
  canvasDefault: "#FFFFFF",
  canvasSubtle: "#F6F8FA",
  canvasInset: "#F3F4F6",
  borderDefault: "#D0D7DE",
  accent: "#0969DA",
  success: "#15803D",
  warning: "#B45309",
  danger: "#DC2626",
  info: "#0284C7",
};

const radius = 3;
const border = `1px solid ${github.borderDefault}`;
const shadowSm = "0 1px 2px rgba(31, 35, 40, 0.08)";
const shadowMd = "0 12px 24px rgba(31, 35, 40, 0.12)";

const theme = createTheme({
  palette: {
    primary: {
      main: github.success,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: github.fgMuted,
      dark: github.fgDefault,
    },
    info: {
      main: github.accent,
    },
    warning: {
      main: github.warning,
    },
    error: {
      main: github.danger,
    },
    success: {
      main: github.success,
    },
    action: {
      hover: alpha(github.fgDefault, 0.06),
      selected: alpha(github.accent, 0.12),
      focus: alpha(github.accent, 0.2),
    },
    text: {
      primary: github.fgDefault,
      secondary: github.fgMuted,
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    divider: github.borderDefault,
  },
  shape: {
    borderRadius: radius,
  },

  typography: {
    fontSize: 12.5,
    fontFamily: [
      '"Segoe UI"',
      "Helvetica",
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
    ].join(","),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        body: {
          backgroundColor: github.canvasSubtle,
          color: github.fgDefault,
        },
        "#root": {
          minHeight: "100vh",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: github.borderDefault,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderColor: github.borderDefault,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: radius,
          border,
          boxShadow: shadowSm,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: radius,
          minHeight: 32,
          paddingInline: 12,
          textTransform: "uppercase",
          fontWeight: 600,
          lineHeight: 1.2,
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        outlined: {
          borderWidth: 1,
          borderColor: "currentColor",
          backgroundColor: github.canvasDefault,
          "&:hover": {
            backgroundColor: github.canvasSubtle,
            borderWidth: 1,
            borderColor: "currentColor",
          },
        },
        text: {
          color: github.fgDefault,
          "&:hover": {
            backgroundColor: alpha(github.fgDefault, 0.06),
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: github.canvasDefault,
          color: github.fgDefault,
          boxShadow: "none",
          borderBottom: border,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: border,
          backgroundImage: "none",
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        separator: {
          color: github.fgSubtle,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: github.accent,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(2px)",
          backgroundColor: "rgba(31, 35, 40, 0.35)",
        },
        paper: {
          borderRadius: radius,
          border,
          boxShadow: shadowMd,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: "1.05rem",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          paddingTop: 20,
          paddingBottom: 12,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "12px 20px 16px",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: border,
        },
        head: {
          color: github.fgMuted,
          backgroundColor: github.canvasSubtle,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.02em",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: radius,
          border,
          boxShadow: shadowMd,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: radius,
          marginInline: 6,
          marginBlock: 2,
        },
      },
    },
  },
});

export default theme;
