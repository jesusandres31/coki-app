import {
  Card,
  CardContent,
  Container,
  CssBaseline,
  Link,
  Stack,
  Typography,
} from "@mui/material";

interface PublicStatusPageProps {
  code?: string;
  title: string;
  message: string;
  linkLabel: string;
}

export const PublicStatusPage = ({
  code,
  title,
  message,
  linkLabel,
}: PublicStatusPageProps): JSX.Element => (
  <Container component="main" maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
    <CssBaseline />
    <Card variant="outlined" sx={{ maxWidth: 520, mx: "auto" }}>
      <CardContent sx={{ py: 5 }}>
        <Stack spacing={code ? 1.5 : 2.5} alignItems="center">
          {code ? (
            <Typography variant="h2" align="center" color="primary.main">
              {code}
            </Typography>
          ) : null}
          <Typography variant={code ? "h5" : "h4"} align="center">
            {title}
          </Typography>
          <Typography variant="body1" color="text.primary" align="center">
            {message}
          </Typography>
          <Link color="primary" href="/">
            {linkLabel}
          </Link>
        </Stack>
      </CardContent>
    </Card>
  </Container>
);
