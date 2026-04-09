import { alpha, createTheme } from "@mui/material";

const github = {
  fgDefault: "#1F2328",
  fgMuted: "#57606A",
  canvasDefault: "#FFFFFF",
  canvasSubtle: "#F6F8FA",
  borderDefault: "#D0D7DE",
  accent: "#0969DA",
  success: "#1A7F37",
  warning: "#9A6700",
  danger: "#CF222E",
};

const radius = 4;
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
      main: github.fgDefault,
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
    text: {
      primary: github.fgDefault,
      secondary: github.fgMuted,
    },
    divider: github.borderDefault,
    background: {
      default: github.canvasSubtle,
      paper: github.canvasDefault,
    },
  },
  shape: {
    borderRadius: radius,
  },
  typography: {
    fontFamily: ["Inter", "Segoe UI", "sans-serif"].join(","),
    fontSize: 13,
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 600, letterSpacing: "-0.01em" },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: github.canvasSubtle,
          color: github.fgDefault,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
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
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: github.fgMuted,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: shadowSm,
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
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: radius,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius,
          backgroundColor: github.canvasDefault,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: github.fgMuted,
        },
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
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: radius,
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
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: alpha(github.fgDefault, 0.03),
          },
          "&.Mui-selected": {
            backgroundColor: alpha(github.accent, 0.1),
          },
          "&.Mui-selected:hover": {
            backgroundColor: alpha(github.accent, 0.15),
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        toolbar: {
          minHeight: 52,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: radius,
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
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: radius,
        },
      },
    },
  },
});

export default theme;
