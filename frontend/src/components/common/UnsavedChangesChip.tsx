import { Tooltip, Chip, Typography, keyframes } from "@mui/material";
import { WarningAmberRounded } from "@mui/icons-material";

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

export const UnsavedChangesChip = () => {
  return (
    <Tooltip title="Debe confirmar los datos para guardarlos">
      <Chip
        icon={<WarningAmberRounded />}
        label={
          <Typography variant="caption" fontWeight="bold">
            Cambios sin guardar
          </Typography>
        }
        variant="outlined"
        //color="primary"
        color="warning"
        size="small"
        sx={{
          cursor: "default",
          animation: `${pulse} 2s ease-in-out infinite`,
        }}
      />
    </Tooltip>
  );
};
