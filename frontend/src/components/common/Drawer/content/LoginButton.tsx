import React from "react";
import {
  Typography,
  ListItemIcon,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  AccountCircleRounded,
  PersonRounded,
  PowerSettingsNewRounded,
} from "@mui/icons-material";
import { useAuth, useRouter } from "src/hooks";
import { AppRoutes } from "src/config";
import { IMenuItem } from "src/types";

export default function LoginButton() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { handleSignOut } = useAuth();
  const { handleGoTo } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleSignOut();
  };

  const ITEMS: IMenuItem[] = [
    {
      text: "Profile",
      icon: <PersonRounded />,
      to: AppRoutes.Profile,
      onClick: () => handleGoTo(AppRoutes.Profile),
    },
    {
      text: "Logout",
      icon: <PowerSettingsNewRounded />,
      to: AppRoutes.Login,
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <IconButton
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        color="inherit"
      >
        <AccountCircleRounded />
      </IconButton>
      <Menu
        /* anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }} */
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {ITEMS.map((item) => (
          <MenuItem key={item.to} onClick={item.onClick}>
            <ListItemIcon sx={{ minWidth: "40px", color: "secondary.light" }}>
              {item.icon}
            </ListItemIcon>
            <Typography variant="subtitle2">{item.text}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
