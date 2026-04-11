import React from "react";
import { Link as RouterLink, Outlet } from "react-router-dom";
import {
  Toolbar,
  IconButton,
  Divider,
  CssBaseline,
  Box,
  Drawer as BaseDrawer,
  Grid,
  Typography,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import {
  MenuRounded,
  ChevronRightRounded,
  ChevronLeftRounded,
} from "@mui/icons-material";
import CustomList from "./content/CustomList";
import LoginButton from "./content/LoginButton";
import { useRouter, useUI } from "src/hooks";
import { DRAWER_SECTIONS } from "src/config/drawer";
import {
  IUIBreadcrumb,
  toggleOpenDrawer,
  useUISelector,
} from "src/slices/uiSlice";
import { useAppDispatch } from "src/app/store";
import { translateTitle } from "./utils";

const DRAWER_WIDTH = 220;

const APPBAR_HEIGHT = 100;

const openedMixin = (theme: Theme): CSSObject => ({
  width: DRAWER_WIDTH,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(8)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: DRAWER_WIDTH,
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const CustomDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const DrawerContent = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  return (
    <Box sx={{ overflow: "hidden" }}>
      <DrawerHeader sx={{ marginBlock: -1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
            cursor: "pointer",
          }}
          onClick={() => dispatch(toggleOpenDrawer())}
        >
          <IconButton>
            {theme.direction === "rtl" ? (
              <ChevronRightRounded />
            ) : (
              <ChevronLeftRounded />
            )}
          </IconButton>
        </Box>
      </DrawerHeader>
      <Box sx={{ overflow: "auto", height: "100%" }}>
        {DRAWER_SECTIONS.map((section, index) => (
          <React.Fragment key={`${index}-${section.title}`}>
            <Divider variant="middle" />
            <Box px={1} pt={1}>
              <CustomList items={section.menuItems} subheader={section.title} />
            </Box>
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

interface DrawerProps {
  noTable?: boolean;
}

export default function Drawer({ noTable }: DrawerProps) {
  const { isMobile } = useUI();
  const { route } = useRouter();
  const { openDrawer, breadcrumbs } = useUISelector((state) => state.ui);
  const dispatch = useAppDispatch();
  const notMobAndOpen = !isMobile && openDrawer;
  const fallbackBreadcrumb: IUIBreadcrumb = {
    label: translateTitle(route) || route,
  };
  const breadcrumbsForRender =
    breadcrumbs.length > 0 ? breadcrumbs : [fallbackBreadcrumb];

  return (
    <Box sx={{ height: "100vh", display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={notMobAndOpen}
        sx={{
          backgroundColor: "secondary.dark",
          color: "common.white",
          borderBottom: "1px solid",
          borderColor: "rgba(255, 255, 255, 0.16)",
        }}
      >
        <Toolbar
          variant="dense"
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Grid>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => dispatch(toggleOpenDrawer())}
                sx={{
                  ...(notMobAndOpen
                    ? { display: "none" }
                    : {
                        mr: 2.5,
                        pl: 1.5,
                      }),
                  color: "inherit",
                }}
              >
                <MenuRounded />
              </IconButton>
            </Grid>
            <Grid>
              <Typography
                variant="subtitle1"
                noWrap
                component="div"
                sx={{
                  color: "inherit",
                  letterSpacing: "0.01em",
                  ...(notMobAndOpen && { paddingLeft: 1.5 }),
                }}
              >
                {translateTitle(route)}
              </Typography>
            </Grid>
          </Grid>
          <Grid
            container
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            sx={{ width: 50, color: "inherit" }}
          >
            <LoginButton />
          </Grid>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        {isMobile ? (
          <BaseDrawer
            variant="temporary"
            open={openDrawer}
            onClose={() => dispatch(toggleOpenDrawer())}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", sm: "none" },
            }}
          >
            <DrawerContent />
          </BaseDrawer>
        ) : (
          <CustomDrawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
            }}
            open={openDrawer}
          >
            <DrawerContent />
          </CustomDrawer>
        )}
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: noTable ? 0 : { xs: 1.5, sm: 2 },
          overflow: "hidden",
          backgroundColor: "background.default",
          paddingBottom: isMobile ? 2 : 3,
        }}
      >
        <Toolbar variant="dense" />
        <Box sx={{ px: 3, pt: 3 }}>
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{ mb: noTable ? 1 : 1.5, px: noTable ? 0 : 0.75 }}
          >
            {breadcrumbsForRender.map((crumb: IUIBreadcrumb, index: number) => {
              const isLast = index === breadcrumbsForRender.length - 1;
              const isClickable = Boolean(crumb.to) && !isLast;

              return !isClickable ? (
                <Typography
                  key={`${crumb.label}-${index}`}
                  color="text.primary"
                  variant="subtitle1"
                >
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={`${crumb.label}-${index}`}
                  component={RouterLink}
                  underline="hover"
                  color="inherit"
                  to={crumb.to as string}
                  variant="subtitle1"
                >
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>
        {noTable ? (
          <Box
            sx={{
              maxHeight: `calc(100vh - ${APPBAR_HEIGHT}px)`,
              overflowY: "auto",
              p: { xs: 1.5, sm: 2 },
              height: "100%",
            }}
          >
            <Outlet />
          </Box>
        ) : (
          <Box
            sx={{
              height: isMobile ? "95%" : `calc(100% - 30px)`,
              backgroundColor: "background.paper",
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Outlet />
          </Box>
        )}
      </Box>
    </Box>
  );
}
