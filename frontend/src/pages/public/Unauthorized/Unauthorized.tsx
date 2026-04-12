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
          <Stack spacing={2.5} alignItems="center">
            <Typography variant="h4" align="center">
              Acceso no autorizado
            </Typography>
            <Typography variant="body1" color="text.primary" align="center">
              No tenés permisos para ingresar a esta sección.
            </Typography>
            <Link color="primary" href="/">
              Volver al inicio
            </Link>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}


