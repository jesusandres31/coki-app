import { useEffect, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  LinearProgress,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { OpenInNewRounded } from "@mui/icons-material";
import {
  useGetMeasureUnitsQuery,
  useGetProductsListQuery,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { AppRoutes } from "src/config";
import { getListArgsInitialState, SEARCH } from "src/constants";
import { useRouter } from "src/hooks";
import { resetBreadcrumbs, setBreadcrumbs } from "src/slices/uiSlice";
import { GetList } from "src/types";
import { ProductsResponse } from "src/types/pocketbase-types";
import { formatMoneyAmount } from "src/utils/format";
import { buildMeasureUnitNameById } from "src/utils/measureUnits";
import { ErrorMsg, TableLoadingSkeleton } from "src/components/common";
import NoItems from "src/components/common/NoItems";
import PageContainer from "src/components/common/PageContainer/PageContainer";
import CustomTableToolbar from "src/components/common/DataGrid/content/CustomTableToolbar";
import { priceListBreadcrumbFlow } from "./breadcrumbFlow";

const ROWS_PER_PAGE = 25;

const contentStateSx = {
  flex: "1 1 auto",
  minHeight: 240,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function PriceList() {
  const dispatch = useAppDispatch();
  const { handleGoToFromCurrent } = useRouter();
  const [filter, setFilter] = useState("");
  const [queryArgs, setQueryArgs] = useState<GetList>(() => ({
    ...getListArgsInitialState,
    perPage: ROWS_PER_PAGE,
    order: "asc",
    orderBy: "name",
  }));

  useEffect(() => {
    dispatch(setBreadcrumbs(priceListBreadcrumbFlow.list()));
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setQueryArgs((current) => ({
        ...current,
        page: 1,
        filter: filter.trim(),
      }));
    }, SEARCH.debounceMs);

    return () => window.clearTimeout(timeout);
  }, [filter]);

  const { data, error, isFetching } = useGetProductsListQuery(queryArgs);
  const {
    data: measureUnits = [],
    error: measureUnitsError,
    isFetching: isFetchingMeasureUnits,
  } = useGetMeasureUnitsQuery();
  const measureUnitById = useMemo(
    () => buildMeasureUnitNameById(measureUnits),
    [measureUnits],
  );

  const items = data?.items || [];
  const isInitialLoading =
    (isFetching || isFetchingMeasureUnits) && data === undefined;
  const hasError = Boolean(error || measureUnitsError);
  const firstItem = data && data.totalItems > 0
    ? (data.page - 1) * data.perPage + 1
    : 0;
  const lastItem = data
    ? Math.min(data.page * data.perPage, data.totalItems)
    : 0;

  const openProduct = (product: ProductsResponse) => {
    handleGoToFromCurrent(
      `${AppRoutes.Products}/${product.id}`,
      "Lista de precios",
    );
  };

  return (
    <PageContainer>
      <CustomTableToolbar
        filter={filter}
        selectedCount={0}
        onSearch={setFilter}
        searchPlaceholder="Buscar producto"
      />

      {(isFetching || isFetchingMeasureUnits) && data !== undefined ? (
        <LinearProgress aria-label="Actualizando lista de precios" />
      ) : null}

      {isInitialLoading ? (
        <Box sx={{ flex: "1 1 auto", minHeight: 0 }}>
          <TableLoadingSkeleton columns={4} rows={10} />
        </Box>
      ) : hasError && items.length === 0 ? (
        <Box sx={contentStateSx}>
          <ErrorMsg message="No se pudo cargar la lista de precios." />
        </Box>
      ) : items.length === 0 ? (
        <Box sx={contentStateSx}>
          <NoItems message="No se encontraron productos." />
        </Box>
      ) : (
        <TableContainer
          sx={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Table
            stickyHeader
            size="small"
            aria-label="Lista de precios de productos"
            sx={{ width: "100%", tableLayout: "fixed" }}
          >
            <colgroup>
              <Box component="col" sx={{ width: { xs: "43%", sm: "50%" } }} />
              <Box component="col" sx={{ width: { xs: "29%", sm: "25%" } }} />
              <Box component="col" sx={{ width: { xs: "12%", sm: "15%" } }} />
              <Box component="col" sx={{ width: { xs: "16%", sm: "10%" } }} />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell sx={{ px: { xs: 1, sm: 2 }, py: 1 }}>
                  <Typography variant="body2" fontWeight={700}>
                    Nombre
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ px: { xs: 0.5, sm: 2 }, py: 1 }}>
                  <Typography variant="body2" fontWeight={700}>
                    Precio
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ px: 0.25, py: 1 }}>
                  <Typography variant="body2" fontWeight={700}>
                    Ud.
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ px: { xs: 0.5, sm: 1 }, py: 1 }}>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
                    Acción
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    aria-hidden="true"
                    sx={{ display: { xs: "block", sm: "none" } }}
                  >
                    Acc.
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((product) => (
                <TableRow hover key={product.id}>
                  <TableCell sx={{ px: { xs: 1, sm: 2 }, py: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{ overflowWrap: "anywhere", lineHeight: 1.25 }}
                    >
                      {product.name}
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ px: { xs: 0.5, sm: 2 }, py: 1 }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        whiteSpace: "nowrap",
                        fontVariantNumeric: "tabular-nums",
                        fontSize: { xs: "0.78rem", sm: "0.875rem" },
                      }}
                    >
                      $ {formatMoneyAmount(product.unit_price)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ px: 0.25, py: 1 }}>
                    <Typography variant="body2" noWrap>
                      {measureUnitById.get(String(product.measure_unit || "")) ||
                        "-"}
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ px: { xs: 0.5, sm: 1 }, py: 0.5 }}
                  >
                    <Tooltip title="Abrir producto">
                      <IconButton
                        size="small"
                        color="primary"
                        aria-label={`Abrir producto ${product.name}`}
                        onClick={() => openProduct(product)}
                        sx={{
                          width: 32,
                          height: 32,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1.25,
                        }}
                      >
                        <OpenInNewRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {data && data.totalItems > 0 ? (
        <Box
          sx={{
            flex: "0 0 auto",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 0.75,
            px: { xs: 1, sm: 2 },
            py: 1,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {`${firstItem}-${lastItem} de ${data.totalItems} productos`}
          </Typography>
          <Pagination
            size="small"
            color="primary"
            page={data.page}
            count={Math.max(1, data.totalPages)}
            siblingCount={0}
            boundaryCount={1}
            onChange={(_, page) =>
              setQueryArgs((current) => ({ ...current, page }))
            }
          />
        </Box>
      ) : null}
    </PageContainer>
  );
}
