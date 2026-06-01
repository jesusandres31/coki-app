import { alpha, createTheme } from "@mui/material";
import type {} from "@mui/x-date-pickers/themeAugmentation";

const app = {
  fgDefault: "#111827",
  fgMuted: "#425466",
  fgSubtle: "#6B7280",
  canvasDefault: "#FFFFFF",
  canvasChrome: "#F8FAFC",
  canvasSubtle: "#F9FAFB",
  canvasInset: "#F3F4F6",
  borderDefault: "#E5E7EB",
  accent: "#4877ef",
  success: "#15803D",
  warning: "#B45309",
  danger: "#c20e0a",
  info: "#4877ef",
};

const radius = 4;
const border = `1px solid ${app.borderDefault}`;
const shadowMd = "0 12px 24px rgba(31, 35, 40, 0.12)";
const shadowSm = "0 1px 2px rgba(31, 35, 40, 0.08)";

const theme = createTheme({
  palette: {
    primary: {
      main: app.fgDefault,
    },
    secondary: {
      main: app.fgMuted,
    },
    info: {
      main: app.accent,
    },
    warning: {
      main: app.warning,
    },
    error: {
      main: app.danger,
    },
    success: {
      main: app.success,
    },
    action: {
      hover: alpha(app.fgDefault, 0.04),
      selected: alpha(app.accent, 0.08),
      focus: alpha(app.accent, 0.18),
    },
    text: {
      primary: app.fgDefault,
      secondary: app.fgMuted,
    },
    background: {
      default: app.canvasDefault,
      paper: app.canvasDefault,
    },
    divider: app.borderDefault,
  },
  shape: {
    borderRadius: radius,
  },

  cssVariables: true,

  // typography: {
  //   fontSize: 13,
  //   fontWeightRegular: 400,
  //   fontFamily: [
  //     '"Inter"',
  //     '"Segoe UI"',
  //     "Helvetica",
  //     "Arial",
  //     "sans-serif",
  //     '"Apple Color Emoji"',
  //     '"Segoe UI Emoji"',
  //   ].join(","),
  // },
  typography: {
    fontSize: 13,

    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    subtitle1: {
      fontWeight: 600,
    },
    subtitle2: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      letterSpacing: 0,
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        body: {
          backgroundColor: app.canvasSubtle,
          color: app.fgDefault,
        },
        "#root": {
          minHeight: "100vh",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: app.borderDefault,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderColor: app.borderDefault,
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
          borderRadius: radius + 2,
          minHeight: 32,
          paddingInline: 12,
          fontWeight: 600,
          lineHeight: 1.2,
        },

        contained: ({ theme, ownerState }) => {
          const colorKey =
            ownerState.color && ownerState.color !== "inherit"
              ? ownerState.color
              : "primary";
          const paletteColor = (theme.palette as any)[colorKey];
          const main = paletteColor?.main || theme.palette.primary.main;
          const contrastText =
            paletteColor?.contrastText || theme.palette.getContrastText(main);

          return {
            color: contrastText,
            background: `linear-gradient(
          to bottom,
          ${alpha("#fff", 0.08)},
          ${alpha("#000", 0.05)}
        ), ${main}`,
            boxShadow: `
          inset 0 1px 0 ${alpha("#fff", 0.15)},
          inset 0 -1px 0 ${alpha("#000", 0.2)}
        `,
            // background: main,
            // boxShadow: "none",
            "&:hover": {
              // background: alpha(main, 0.9),
              // boxShadow: "none",
              background: `linear-gradient(
            to bottom,
            ${alpha("#fff", 0.12)},
            ${alpha("#000", 0.08)}
          ), ${main}`,
              boxShadow: `
            inset 0 1px 0 ${alpha("#fff", 0.18)},
            inset 0 -1px 0 ${alpha("#000", 0.24)}
          `,
            },
            "&:active": {
              // background: alpha(main, 0.84),
              background: `linear-gradient(
            to bottom,
            ${alpha("#000", 0.04)},
            ${alpha("#fff", 0.04)}
          ), ${main}`,
            },
          };
        },

        outlined: {
          borderWidth: 1,
          borderColor: "currentColor",
          backgroundColor: app.canvasDefault,
          "&:hover": {
            backgroundColor: app.canvasSubtle,
            borderWidth: 1,
            borderColor: "currentColor",
          },
        },

        text: {
          color: app.fgDefault,
          "&:hover": {
            backgroundColor: alpha(app.fgDefault, 0.04),
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: app.canvasChrome,
          color: app.fgDefault,
          boxShadow: "none",
          borderBottom: border,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: border,
          backgroundColor: app.canvasChrome,
          backgroundImage: "none",
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        separator: {
          color: app.fgSubtle,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: app.accent,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          minHeight: 18,
          marginTop: 4,
          marginLeft: 0,
          marginRight: 0,
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        color: "primary",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius + 2,
          transition: "box-shadow 120ms ease, border-color 120ms ease",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: app.borderDefault,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(app.fgDefault, 0.35),
          },
          "&.Mui-focused": {
            boxShadow: `0 0 0 2px ${alpha(app.accent, 0.35)}`,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(app.accent, 0.45),
            borderWidth: 1,
          },
          "&.Mui-disabled": {
            backgroundColor: app.canvasInset,
          },
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: app.fgDefault,
          },
        },
      },
    },
    MuiPickersInputBase: {
      styleOverrides: {
        activeBar: {
          backgroundColor: app.accent,
        },
      },
    },
    MuiPickersTextField: {
      defaultProps: {
        color: "info",
      },
    },
    MuiPickersOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius + 2,
          transition: "box-shadow 120ms ease, border-color 120ms ease",
          "& .MuiPickersOutlinedInput-notchedOutline": {
            borderColor: app.borderDefault,
          },
          "&:hover .MuiPickersOutlinedInput-notchedOutline": {
            borderColor: alpha(app.fgDefault, 0.35),
          },
          "&.Mui-focused": {
            boxShadow: `0 0 0 2px ${alpha(app.accent, 0.35)}`,
          },
          "&.Mui-focused .MuiPickersOutlinedInput-notchedOutline": {
            borderColor: alpha(app.accent, 0.45),
            borderWidth: 1,
          },
          "&.MuiPickersInputBase-focused .MuiPickersOutlinedInput-notchedOutline":
            {
              borderColor: alpha(app.accent, 0.45),
              borderWidth: 1,
            },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderTopLeftRadius: radius + 2,
          borderTopRightRadius: radius + 2,
          transition: "box-shadow 120ms ease, border-color 120ms ease",
          "&:before": {
            borderBottomColor: app.borderDefault,
          },
          "&:hover:not(.Mui-disabled, .Mui-error):before": {
            borderBottomColor: alpha(app.fgDefault, 0.35),
          },
          "&.Mui-focused": {
            boxShadow: `0 0 0 2px ${alpha(app.accent, 0.35)}`,
          },
          "&.Mui-focused:after": {
            borderBottomColor: app.accent,
            borderBottomWidth: 1,
          },
          "&.Mui-disabled": {
            backgroundColor: app.canvasInset,
          },
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: app.fgDefault,
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          transition: "border-color 120ms ease",
          "&:before": {
            borderBottomColor: app.borderDefault,
          },
          "&:hover:not(.Mui-disabled, .Mui-error):before": {
            borderBottomColor: alpha(app.fgDefault, 0.35),
          },
          "&.Mui-focused:after": {
            borderBottomColor: alpha(app.accent, 0.45),
            borderBottomWidth: 1,
          },
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: app.fgDefault,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: app.fgDefault,
          "&.Mui-focused": {
            color: app.accent,
          },
          "&.Mui-disabled": {
            color: app.fgMuted,
          },
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
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: border,
        },
        head: {
          color: app.fgDefault,
          backgroundColor: app.canvasChrome,
          fontWeight: 650,
          fontSize: 12,
          letterSpacing: "0.01em",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: alpha(app.fgDefault, 0.02),
          },
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
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "currentColor",
        },
      },
    },
  },
});

export default theme;
