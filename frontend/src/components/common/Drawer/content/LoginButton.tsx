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
      text: "Perfil",
      icon: <PersonRounded />,
      to: AppRoutes.Profile,
      onClick: () => handleGoTo(AppRoutes.Profile),
    },
    {
      text: "Cerrar sesión",
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
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {ITEMS.map((item) => (
          <MenuItem
            key={item.to}
            onClick={() => {
              item.onClick?.();
              handleClose();
            }}
          >
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
