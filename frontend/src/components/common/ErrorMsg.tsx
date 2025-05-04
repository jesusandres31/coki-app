import { Grid, Typography } from "@mui/material";
import { WarningRounded } from "@mui/icons-material";

const ErrorMsg = ({
  message = "Something went wrong.",
}: {
  message?: string;
}) => {
  return (
    <>
      <Grid>
        <WarningRounded fontSize="large" sx={{ color: "text.secondary" }} />
      </Grid>
      <Grid sx={{ textAlign: "center" }}>
        <Typography variant="subtitle1" color="text.secondary">
          {message}
        </Typography>
      </Grid>
    </>
  );
};

export default ErrorMsg;
