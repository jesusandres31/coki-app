import { SvgIconComponent } from "@mui/icons-material";
import { Grid, Typography } from "@mui/material";

interface EmptyStateProps {
  icon: SvgIconComponent;
  message: string;
}

const EmptyState = ({ icon: Icon, message }: EmptyStateProps) => (
  <>
    <Grid sx={{ textAlign: "center" }}>
      <Icon fontSize="large" sx={{ color: "text.primary" }} />
    </Grid>
    <Grid sx={{ textAlign: "center" }}>
      <Typography variant="subtitle1" color="text.primary">
        {message}
      </Typography>
    </Grid>
  </>
);

export default EmptyState;
