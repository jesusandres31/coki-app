import {
  CssBaseline,
  Box,
  Container,
  Button,
  Typography,
  CardContent,
  Card,
} from "@mui/material";
import { useAuth, useRouter } from "src/hooks";
import { ChevronLeftRounded } from "@mui/icons-material";
import { AppRoutes } from "src/config";
import { useState } from "react";
import UpdateUserPsswd from "./content/UpdateUserPsswd";

export default function UpdateProfile() {
  const { authUser } = useAuth();
  const { handleGoTo } = useRouter();
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  return (
    <Container component="main" maxWidth="md" sx={{ p: 4 }}>
      <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
        <Button
          color="secondary"
          size="large"
          variant="outlined"
          startIcon={<ChevronLeftRounded />}
          onClick={() => handleGoTo(AppRoutes.Index)}
        >
          Atras
        </Button>
      </Box>
      <CssBaseline />
      <Box
        sx={{
          marginTop: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" display="block" gutterBottom>
              {authUser?.username}
            </Typography>
            <Typography variant="subtitle1" display="block" gutterBottom>
              {authUser?.email}
            </Typography>
            <Box pt={5}>
              <Button
                color="secondary"
                variant="contained"
                size="large"
                onClick={() => setOpen(true)}
              >
                Cambiar Contraseña
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <UpdateUserPsswd open={open} handleClose={handleClose} />
    </Container>
  );
}
