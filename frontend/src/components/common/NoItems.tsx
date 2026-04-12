import { Grid, Typography } from "@mui/material";
import { SearchOffRounded } from "@mui/icons-material";

interface NoItemsProps {
  message?: string;
}

const NoItems = ({ message = "No items found." }: NoItemsProps) => {
  return (
    <>
      <Grid sx={{ textAlign: "center" }}>
        <SearchOffRounded fontSize="large" sx={{ color: "text.primary" }} />
      </Grid>
      <Grid sx={{ textAlign: "center" }}>
        <Typography variant="subtitle1" color="text.primary">
          {message}
        </Typography>
      </Grid>
    </>
  );
};

export default NoItems;

