import React from "react";
import { Grid, Typography, Button, IconButton, Tooltip } from "@mui/material";
import { useUI } from "src/hooks";

type Color =
  | "inherit"
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "info"
  | "warning";

export interface CustomGridProps {
  children: React.ReactNode;
}

export const CustomGrid = ({ children }: CustomGridProps) => {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ height: "100%" }}
      direction="column"
    >
      {children}
    </Grid>
  );
};

export interface CustomButtonProps {
  color?: Color;
  text: string;
  onClick: Function;
  icon: React.ReactNode;
}

export const CustomButton = ({
  color,
  text,
  onClick,
  icon,
}: CustomButtonProps) => {
  const { isMobile } = useUI();

  return (
    <Button
      variant="contained"
      color={color ? color : "primary"}
      size={isMobile ? "small" : "medium"}
      onClick={(e) => onClick(e)}
      startIcon={icon}
    >
      <Typography sx={{ fontWeight: "bold" }}>{text}</Typography>
    </Button>
  );
};

export interface CustomIconButtonProps {
  text: string;
  onClick: Function;
  icon: React.ReactNode;
}

export const CustomIconButton = ({
  text,
  onClick,
  icon,
}: CustomIconButtonProps) => {
  const { isMobile } = useUI();

  return (
    <Tooltip title={text}>
      <IconButton
        sx={{ color: "secondary.light" }}
        size={isMobile ? "small" : "medium"}
        onClick={(e) => onClick(e)}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
};
