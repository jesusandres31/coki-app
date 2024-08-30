import { Typography, Grid, Link, Container, CssBaseline } from "@mui/material";

export default function NotFound(): JSX.Element {
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Grid
        container
        direction="row"
        justifyContent="flex-center"
        alignItems="center"
        sx={{ pt: 20 }}
      >
        <Grid item xs={12} sm={12} sx={{ pt: 5 }}>
          <Grid container direction="row" justifyContent="center">
            <Typography variant="h1" align="center">
              404
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={12} sx={{ py: 0 }}>
          <Grid container direction="row" justifyContent="center">
            <Typography variant="h3" align="center">
              Page Not Found!
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={12} sx={{ py: 5 }}>
          <Grid container direction="row" justifyContent="center">
            <Link color="inherit" href="/">
              Go back
            </Link>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
