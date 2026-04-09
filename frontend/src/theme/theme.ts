import { alpha, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#D19100",
      dark: "#A36F00",
      light: "#F2C65D",
      contrastText: "#111827",
    },
    secondary: {
      main: "#1E293B",
      dark: "#0F172A",
      light: "#334155",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#1D4ED8",
    },
    warning: {
      main: "#B45309",
    },
    error: {
      main: "#B91C1C",
    },
    success: {
      main: "#166534",
    },
    text: {
      primary: "#0F172A",
      secondary: "#475569",
      disabled: "#94A3B8",
    },
    divider: "#E2E8F0",
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
  },
  shape: {
    borderRadius: 4,
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
          backgroundColor: "#F8FAFC",
          color: "#0F172A",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderColor: "#E2E8F0",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: "none",
          fontWeight: 600,
        },
        containedPrimary: {
          color: "#111827",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#475569",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "1px solid #E2E8F0",
          backgroundImage: "none",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
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
          borderRadius: 4,
          backgroundColor: "#FFFFFF",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#64748B",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(2px)",
          backgroundColor: "rgba(2, 6, 23, 0.35)",
        },
        paper: {
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.15)",
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
          borderRadius: 4,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #E2E8F0",
        },
        head: {
          color: "#475569",
          backgroundColor: "#F8FAFC",
          fontWeight: 700,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: alpha("#1E293B", 0.03),
          },
          "&.Mui-selected": {
            backgroundColor: alpha("#D19100", 0.11),
          },
          "&.Mui-selected:hover": {
            backgroundColor: alpha("#D19100", 0.16),
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
          borderRadius: 4,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          marginInline: 6,
          marginBlock: 2,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
});

export default theme;
