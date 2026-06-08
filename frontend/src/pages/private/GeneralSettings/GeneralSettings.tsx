import { useEffect } from "react";
import {
  Box,
  Card,
  Container,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import {
  useGetConfigQuery,
  useUpdateConfigMutation,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { ErrorMsg, Loading } from "src/components/common";
import PageContainer from "src/components/common/PageContainer/PageContainer";
import { configKey } from "src/config";
import {
  resetBreadcrumbs,
  setBreadcrumbs,
  setSnackbar,
} from "src/slices/uiSlice";
import { generalSettingsBreadcrumbFlow } from "./breadcrumbFlow";

const cardSx = {
  borderColor: "divider",
  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
};

const feedbackCardSx = {
  ...cardSx,
  minHeight: { xs: 320, md: 420 },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function GeneralSettings() {
  const dispatch = useAppDispatch();
  const { data: appConfig, isFetching, error } = useGetConfigQuery();
  const [updateConfig, { isLoading: isUpdating }] = useUpdateConfigMutation();

  useEffect(() => {
    dispatch(setBreadcrumbs(generalSettingsBreadcrumbFlow.page()));
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch]);

  const handleRetrieveLastPriceChange = async (checked: boolean) => {
    if (!appConfig) return;

    try {
      await updateConfig({
        id: appConfig.id,
        data: {
          retrieve_last_price: checked,
        },
      }).unwrap();

      dispatch(
        setSnackbar({
          message: "Configuración actualizada satisfactoriamente.",
          type: "success",
        }),
      );
    } catch {
      dispatch(
        setSnackbar({
          message: "No se pudo actualizar la configuración.",
          type: "error",
        }),
      );
    }
  };

  if (isFetching) {
    return (
      <PageContainer>
        <Container
          component="main"
          maxWidth="lg"
          sx={{ py: 3, width: "100%", mx: "auto" }}
        >
          <Card variant="outlined" sx={feedbackCardSx}>
            <Loading />
          </Card>
        </Container>
      </PageContainer>
    );
  }

  if (error || !appConfig) {
    return (
      <PageContainer>
        <Container
          component="main"
          maxWidth="lg"
          sx={{ py: 3, width: "100%", mx: "auto" }}
        >
          <Card variant="outlined" sx={feedbackCardSx}>
            <Box sx={{ textAlign: "center" }}>
              <ErrorMsg />
            </Box>
          </Card>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container
        component="main"
        maxWidth="lg"
        sx={{ py: 3, width: "100%", mx: "auto" }}
      >
        <Card variant="outlined" sx={cardSx}>
          <Stack spacing={3} sx={{ p: { xs: 2, md: 3 } }}>
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
                Configuración general
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Empresa: {appConfig.company || configKey.COMPANY}
              </Typography>
            </Box>
            <Divider />
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Recuperar último precio de productos por cliente en
                  facturación
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(appConfig.retrieve_last_price)}
                    onChange={(_, checked) =>
                      void handleRetrieveLastPriceChange(checked)
                    }
                    disabled={isUpdating}
                    inputProps={{
                      "aria-label":
                        "Recuperar último precio de productos por cliente en facturación",
                    }}
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box component="span">
                      {Boolean(appConfig.retrieve_last_price)
                        ? "Activo"
                        : "Inactivo"}
                    </Box>
                    {isUpdating ? (
                      <CircularProgress color="inherit" size={16} />
                    ) : null}
                  </Stack>
                }
                labelPlacement="start"
                sx={{ m: 0 }}
              />
            </Stack>
          </Stack>
        </Card>
      </Container>
    </PageContainer>
  );
}
