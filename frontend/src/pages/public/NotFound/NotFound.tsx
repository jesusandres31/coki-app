import {
  Typography,
  Link,
  Container,
  CssBaseline,
  Card,
  CardContent,
  Stack,
} from "@mui/material";

export default function NotFound(): JSX.Element {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <CssBaseline />
      <Card variant="outlined" sx={{ maxWidth: 520, mx: "auto" }}>
        <CardContent sx={{ py: 5 }}>
          <Stack spacing={1.5} alignItems="center">
            <Typography variant="h2" align="center" color="primary.main">
              404
            </Typography>
            <Typography variant="h5" align="center">
              Página no encontrada
            </Typography>
            <Typography variant="body1" color="text.primary" align="center">
              El recurso que buscás no existe o fue movido.
            </Typography>
            <Link color="primary" href="/">
              Volver
            </Link>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}


