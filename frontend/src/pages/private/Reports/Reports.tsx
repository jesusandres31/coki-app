import { useEffect } from "react";
import { Container } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useLocation } from "react-router-dom";
import { useAppDispatch } from "src/app/store";
import PageContainer from "src/components/common/PageContainer/PageContainer";
import { AppRoutes } from "src/config";
import { resetBreadcrumbs, setBreadcrumbs } from "src/slices/uiSlice";
import { reportsBreadcrumbFlow } from "./breadcrumbFlow";
import ListaDePrecios from "./ListaDePrecios/ListaDePrecios";
import ListaDeRepartoPorDias from "./ListaDeRepartoPorDias/ListaDeRepartoPorDias";
import VentasPorPeriodo from "./VentasPorPeriodo/VentasPorPeriodo";

export default function Reports() {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();

  useEffect(() => {
    dispatch(setBreadcrumbs(reportsBreadcrumbFlow.list()));
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch]);

  const isSalesRoute = pathname.startsWith(AppRoutes.ReportsSales);
  const isPriceListRoute = pathname.startsWith(AppRoutes.ReportsPriceList);

  return (
    <PageContainer>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Container
          component="main"
          maxWidth="xl"
          sx={{
            py: { xs: 2, md: 3 },
            px: { xs: 1, sm: 2 },
            width: "100%",
            height: "100%",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflow: "hidden",
          }}
        >
          {isPriceListRoute ? (
            <ListaDePrecios />
          ) : isSalesRoute ? (
            <VentasPorPeriodo />
          ) : (
            <ListaDeRepartoPorDias />
          )}
        </Container>
      </LocalizationProvider>
    </PageContainer>
  );
}
