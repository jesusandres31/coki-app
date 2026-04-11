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
  success: "#1A7F37",
  warning: "#9A6700",
  danger: "#CF222E",
};

const radius = 5;
const border = `1px solid ${github.borderDefault}`;
const shadowSm = "0 1px 2px rgba(31, 35, 40, 0.08)";
const shadowMd = "0 12px 24px rgba(31, 35, 40, 0.12)";
const focusRing = `0 0 0 3px ${alpha(github.accent, 0.25)}`;

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
    // text: {
    //   primary: "#050505",
    // },
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
    // fontFamily: ["Inter", "sans-serif"].join(","),
    fontSize: 12.5,
    fontFamily: [
      // "-apple-system",
      // "BlinkMacSystemFont",
      '"Segoe UI"',
      "Helvetica",
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
    ].join(","),
    // fontSize: 13,
    // h1: { fontWeight: 600, letterSpacing: "-0.02em" },
    // h2: { fontWeight: 600, letterSpacing: "-0.02em" },
    // h3: { fontWeight: 600, letterSpacing: "-0.02em" },
    // h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    // h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    // h6: { fontWeight: 600, letterSpacing: "-0.01em" },
    // body1: { lineHeight: 1.45 },
    // body2: { lineHeight: 1.45 },
    // subtitle1: { fontWeight: 600 },
    // subtitle2: { fontWeight: 600 },
    // button: { fontWeight: 600, textTransform: "uppercase" },
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
    // MuiDivider: {
    //   styleOverrides: {
    //     root: {
    //       borderColor: github.borderDefault,
    //     },
    //   },
    // },
    // MuiPaper: {
    //   styleOverrides: {
    //     root: {
    //       backgroundImage: "none",
    //       borderColor: github.borderDefault,
    //     },
    //   },
    // },
    // MuiCard: {
    //   styleOverrides: {
    //     root: {
    //       borderRadius: radius,
    //       border,
    //       boxShadow: shadowSm,
    //     },
    //   },
    // },
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
        // containedPrimary: {
        //   backgroundColor: github.success,
        //   "&:hover": {
        //     backgroundColor: "#176F32",
        //   },
        // },
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
    // MuiIconButton: {
    //   styleOverrides: {
    //     root: {
    //       color: github.fgMuted,
    //       "&:hover": {
    //         backgroundColor: alpha(github.fgDefault, 0.06),
    //       },
    //     },
    //   },
    // },
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
    // MuiListItemButton: {
    //   styleOverrides: {
    //     root: {
    //       borderRadius: radius,
    //     },
    //   },
    // },
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
    // MuiOutlinedInput: {
    //   styleOverrides: {
    //     root: {
    //       borderRadius: radius,
    //       backgroundColor: github.canvasDefault,
    //       "&:hover .MuiOutlinedInput-notchedOutline": {
    //         borderColor: github.fgSubtle,
    //       },
    //       "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    //         borderColor: github.accent,
    //         boxShadow: focusRing,
    //       },
    //     },
    //     input: {
    //       paddingTop: 9,
    //       paddingBottom: 9,
    //     },
    //   },
    // },
    // MuiInputLabel: {
    //   styleOverrides: {
    //     root: {
    //       color: github.fgMuted,
    //     },
    //   },
    // },
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
    // MuiTableContainer: {
    //   styleOverrides: {
    //     root: {
    //       border: 0,
    //       borderRadius: 0,
    //     },
    //   },
    // },
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
    // MuiTableRow: {
    //   styleOverrides: {
    //     root: {
    //       "&:hover": {
    //         backgroundColor: alpha(github.fgDefault, 0.03),
    //       },
    //       "&.Mui-selected": {
    //         backgroundColor: alpha(github.accent, 0.1),
    //       },
    //       "&.Mui-selected:hover": {
    //         backgroundColor: alpha(github.accent, 0.15),
    //       },
    //     },
    //   },
    // },
    // MuiTablePagination: {
    //   styleOverrides: {
    //     toolbar: {
    //       minHeight: 52,
    //     },
    //   },
    // },
    // MuiChip: {
    //   styleOverrides: {
    //     root: {
    //       borderRadius: radius,
    //     },
    //   },
    // },
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
    // MuiAlert: {
    //   styleOverrides: {
    //     root: {
    //       borderRadius: radius,
    //     },
    //   },
    // },
  },
});

export default theme;
