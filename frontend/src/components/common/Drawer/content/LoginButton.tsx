import React from "react";
import {
  Typography,
  ListItemIcon,
  Menu,
  MenuItem,
  IconButton,
  CircularProgress,
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
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const open = Boolean(anchorEl);
  const { handleSignOut } = useAuth();
  const { handleGoTo } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await handleSignOut();
    } finally {
      setIsSigningOut(false);
    }
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
        disabled={isSigningOut}
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
            disabled={isSigningOut}
            onClick={async () => {
              if (item.to === AppRoutes.Login) {
                await handleLogout();
                return;
              }

              item.onClick?.();
              handleClose();
            }}
          >
            <ListItemIcon sx={{ minWidth: "40px", color: "primary.main" }}>
              {item.icon}
            </ListItemIcon>
            <Typography variant="subtitle2">{item.text}</Typography>
            {item.to === AppRoutes.Login && isSigningOut ? (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            ) : null}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

