import React from "react";
import { Outlet } from "react-router-dom";
import {
  Toolbar,
  IconButton,
  Divider,
  CssBaseline,
  Box,
  Drawer as BaseDrawer,
  Grid,
  Typography,
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
import { toggleOpenDrawer, useUISelector } from "src/slices/ui/uiSlice";
import { useAppDispatch } from "src/app/store";
import { translateTitle } from "src/utils/header";
// import StoreSelector from "./content/StoreSelector";

const DRAWER_WIDTH = 220;

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

export default function Dashboard() {
  const { isMobile } = useUI();
  const { route } = useRouter();
  const { openDrawer } = useUISelector((state) => state.ui);
  const dispatch = useAppDispatch();
  const notMobAndOpen = !isMobile && openDrawer;

  return (
    <Box sx={{ height: "100vh", display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={notMobAndOpen}
        sx={{
          boxShadow: 0,
          backgroundColor: "secondary.main",
          //  backgroundColor: lighten(theme.palette.text.primary, 0.15),
        }}
      >
        <Toolbar variant="dense">
          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Grid item>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => dispatch(toggleOpenDrawer())}
                sx={{
                  ...(notMobAndOpen
                    ? { display: "none" }
                    : {
                        mr: 5.5,
                        pl: 1.5,
                      }),
                  color: "white",
                }}
              >
                <MenuRounded />
              </IconButton>
            </Grid>
            {/* <Grid item>
              <StoreSelector />
            </Grid> */}
            <Grid item>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  color: "white",
                  ...(notMobAndOpen && { paddingLeft: 1 }),
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
            sx={{ width: 50, color: "white" }}
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
          p: 3,
          overflow: "hidden",
          backgroundColor: "background.paper",
        }}
      >
        <Toolbar variant="dense" />
        <Box
          sx={{
            height: isMobile ? "95%" : `calc(100% - 30px)`,
            //  if using the Paper component
            // : { sm: `calc(100% - 60px)`, md: `calc(100% - 50px)` },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
