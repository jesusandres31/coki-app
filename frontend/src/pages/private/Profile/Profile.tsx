import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronLeftRounded, LockResetRounded } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { useAuth, useRouter } from "src/hooks";
import { AppRoutes } from "src/config";
import UpdateUserPsswd from "./content/UpdateUserPsswd";

export default function UpdateProfile() {
  const { authUser } = useAuth();
  const { handleGoTo } = useRouter();
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  const initials = useMemo(() => {
    if (!authUser?.username) return "U";
    return authUser.username.slice(0, 2).toUpperCase();
  }, [authUser?.username]);

  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <CssBaseline />

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600} color="text.primary">
          Mi perfil
        </Typography>
        <Button
          color="secondary"
          size="medium"
          variant="outlined"
          startIcon={<ChevronLeftRounded />}
          onClick={() => handleGoTo(AppRoutes.Index)}
        >
          Atrás
        </Button>
      </Stack>

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          borderColor: "divider",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
              <Avatar sx={{ bgcolor: "secondary.main", width: 56, height: 56, fontWeight: 700 }}>
                {initials}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  {authUser?.username || "Usuario"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Información de cuenta y seguridad
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                Correo electrónico
              </Typography>
              <Typography variant="body1" color="text.primary">
                {authUser?.email || "-"}
              </Typography>
              {(authUser?.expand?.role?.name || authUser?.role) && (
                <Chip
                  label={`Rol: ${authUser?.expand?.role?.name ?? authUser?.role}`}
                  size="small"
                  variant="outlined"
                  sx={{ alignSelf: "flex-start", mt: 1 }}
                />
              )}
            </Stack>

            <Divider />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between">
              <Box>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  Seguridad
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cambiá tu contraseña y se cerrará la sesión actual por seguridad.
                </Typography>
              </Box>
              <Button
                color="secondary"
                variant="contained"
                startIcon={<LockResetRounded />}
                onClick={() => setOpen(true)}
                sx={{ minWidth: { xs: "100%", sm: 220 } }}
              >
                Cambiar contraseña
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <UpdateUserPsswd open={open} handleClose={handleClose} />
    </Container>
  );
}

