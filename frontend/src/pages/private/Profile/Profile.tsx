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
import UpdateUserPsswd from "./content/UpdateUserPsswd";
import { useAppDispatch } from "src/app/store";
import { openModal, useUISelector } from "src/slices/ui/uiSlice";
import { Entity } from "src/types";

const ENTITY: Entity = "user";

export default function Profile() {
  const dispatch = useAppDispatch();
  const { authUser } = useAuth();
  const { handleGoTo } = useRouter();
  const { actionModal } = useUISelector((state) => state.ui);

  const MODAL = {
    update: actionModal.update === ENTITY,
  };

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
                onClick={() =>
                  dispatch(openModal({ entity: ENTITY, action: "update" }))
                }
              >
                Cambiar Contraseña
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <UpdateUserPsswd open={MODAL.update} />
    </Container>
  );
}
