import { EditRounded, RefreshRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  forwardRef,
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TableComponents, TableVirtuoso } from "react-virtuoso";
import {
  GetProductsInfiniteReq,
  useGetPriceListProductsInfiniteQuery,
} from "src/app/services/invoiceService";
import { ErrorMsg, TableLoadingSkeleton } from "src/components/common";
import CustomTableToolbar from "src/components/common/DataGrid/content/CustomTableToolbar";
import { CustomGrid } from "src/components/common/DataGrid/content/utils";
import NoItems from "src/components/common/NoItems";
import PageContainer from "src/components/common/PageContainer/PageContainer";
import { SEARCH } from "src/constants";
import { useUI } from "src/hooks";
import { IColumn, Order } from "src/types";
import { ProductsResponse } from "src/types/pocketbase-types";
import { formatNulls, renderValue } from "src/utils/format";
import useProductListColumns from "../Products/useProductListColumns";

interface VirtualizedPriceListGridProps {
  onEdit: (product: ProductsResponse) => void;
  onQueryChange: (query: GetProductsInfiniteReq) => void;
}

const ACTIONS_COLUMN_WIDTH = 54;

const virtuosoComponents: TableComponents<ProductsResponse> = {
  Scroller: forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
  >((props, ref) => (
    <TableContainer
      {...props}
      ref={ref}
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    />
  )),
  Table: (props) => (
    <Table
      {...props}
      stickyHeader
      sx={{
        borderCollapse: "separate",
        tableLayout: "fixed",
        width: "100%",
        "& .MuiTableCell-root": { px: { xs: 0.75, sm: 2 } },
      }}
    />
  ),
  TableHead: forwardRef<
    HTMLTableSectionElement,
    HTMLAttributes<HTMLTableSectionElement>
  >((props, ref) => <TableHead {...props} ref={ref} />),
  TableRow: (props) => (
    <TableRow
      {...props}
      sx={{
        "&:hover > th, &:hover > td": {
          backgroundColor: "background.paper",
          backgroundImage: (theme) =>
            `linear-gradient(${theme.palette.action.hover}, ${theme.palette.action.hover})`,
        },
      }}
    />
  ),
  TableBody: forwardRef<
    HTMLTableSectionElement,
    HTMLAttributes<HTMLTableSectionElement>
  >((props, ref) => <TableBody {...props} ref={ref} />),
};

export default function VirtualizedPriceListGrid({
  onEdit,
  onQueryChange,
}: VirtualizedPriceListGridProps) {
  const { isMobile } = useUI();
  const { columns, isFetchingLookups } = useProductListColumns();
  const visibleColumns = useMemo(
    () =>
      columns.filter(
        (column) => !isMobile || !column.hideOnMobile,
      ) as IColumn<ProductsResponse>[],
    [columns, isMobile],
  );
  const isRequestingNextPage = useRef(false);
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilter(filter);
    }, SEARCH.debounceMs);

    return () => clearTimeout(timeout);
  }, [filter]);

  const queryArgs = useMemo<GetProductsInfiniteReq>(
    () => ({ filter: debouncedFilter, order, orderBy }),
    [debouncedFilter, order, orderBy],
  );

  useEffect(() => {
    onQueryChange(queryArgs);
  }, [onQueryChange, queryArgs]);

  const {
    currentData,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    isLoading,
    refetch,
  } = useGetPriceListProductsInfiniteQuery(queryArgs);

  const products = useMemo(() => {
    const uniqueProducts = new Map<string, ProductsResponse>();
    currentData?.pages.forEach((page) => {
      page.items.forEach((product) => uniqueProducts.set(product.id, product));
    });
    return Array.from(uniqueProducts.values());
  }, [currentData]);

  const handleSort = useCallback(
    (columnId: string) => {
      if (orderBy === columnId) {
        setOrder((previous) => (previous === "asc" ? "desc" : "asc"));
        return;
      }
      setOrderBy(columnId);
      setOrder("asc");
    },
    [orderBy],
  );

  const handleFetchNextPage = useCallback(() => {
    if (
      !hasNextPage ||
      isFetchingNextPage ||
      isRequestingNextPage.current
    ) {
      return;
    }

    isRequestingNextPage.current = true;
    void fetchNextPage().finally(() => {
      isRequestingNextPage.current = false;
    });
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const fixedHeaderContent = useCallback(
    () => (
      <TableRow sx={{ "& .MuiTableCell-head": { py: 1 } }}>
        {visibleColumns.map((column) => {
          const columnId = String(column.id);
          const active = orderBy === columnId;
          const direction = active ? order : "asc";

          return (
            <TableCell
              key={columnId}
              variant="head"
              align={column.align ?? "right"}
              sortDirection={active ? direction : false}
              style={{
                width: isMobile
                  ? column.mobileWidth
                  : (column.width ?? column.minWidth),
              }}
              sx={{ minWidth: isMobile ? 0 : column.minWidth }}
            >
              <TableSortLabel
                active={active}
                direction={direction}
                disabled={column.disableSort}
                hideSortIcon
                onClick={() => handleSort(columnId)}
                sx={{
                  display: isMobile ? "flex" : "inline-flex",
                  maxWidth: "100%",
                  "& .MuiTableSortLabel-icon": {
                    color: "text.primary !important",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={700}
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  {isMobile
                    ? (column.mobileLabel ?? column.label)
                    : column.label}
                </Typography>
              </TableSortLabel>
            </TableCell>
          );
        })}
        <TableCell
          aria-label="Acciones"
          align="center"
          sx={{
            position: "sticky",
            right: 0,
            zIndex: 3,
            width: ACTIONS_COLUMN_WIDTH,
            minWidth: ACTIONS_COLUMN_WIDTH,
            maxWidth: ACTIONS_COLUMN_WIDTH,
            bgcolor: "#F8FAFC",
            pl: 1,
            pr: 1,
          }}
        >
          {!isMobile && (
            <Typography variant="body2" fontWeight={700}>
              Acciones
            </Typography>
          )}
        </TableCell>
      </TableRow>
    ),
    [handleSort, isMobile, order, orderBy, visibleColumns],
  );

  const itemContent = useCallback(
    (_index: number, product: ProductsResponse) => (
      <>
        {visibleColumns.map((column) => {
          const value = column.render
            ? column.render(product)
            : formatNulls(product[column.id]);

          return (
            <TableCell
              component="th"
              scope="row"
              size="small"
              key={String(column.id)}
              align={column.align ?? "right"}
              sx={{
                width: isMobile
                  ? column.mobileWidth
                  : (column.width ?? column.minWidth),
                minWidth: isMobile ? 0 : column.minWidth,
                height: 44,
                py: 0.5,
                bgcolor: "background.paper",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                component="div"
                color="text.primary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace:
                    isMobile && column.type !== "number" ? "normal" : "nowrap",
                  overflowWrap: "anywhere",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  fontWeight: 450,
                }}
              >
                {renderValue(value)}
              </Typography>
            </TableCell>
          );
        })}
        <TableCell
          align="center"
          sx={{
            position: "sticky",
            right: 0,
            zIndex: 1,
            width: ACTIONS_COLUMN_WIDTH,
            minWidth: ACTIONS_COLUMN_WIDTH,
            maxWidth: ACTIONS_COLUMN_WIDTH,
            py: 0.25,
            pl: 1,
            pr: 1,
            bgcolor: "background.paper",
            borderColor: "divider",
          }}
        >
          <Tooltip title="Editar">
            <IconButton
              aria-label={`Editar precio de ${product.name || "producto"}`}
              onClick={() => onEdit(product)}
              sx={{
                width: 30,
                height: 30,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.25,
                p: 0.5,
              }}
            >
              <EditRounded fontSize="small" color="info" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </>
    ),
    [isMobile, onEdit, visibleColumns],
  );

  const isInitialLoading =
    products.length === 0 && (isLoading || isFetching || isFetchingLookups);
  const isInitialError = products.length === 0 && isError;

  return (
    <PageContainer>
      <CustomTableToolbar
        filter={filter}
        selectedCount={0}
        onSearch={setFilter}
        searchPlaceholder="Buscar producto"
      />

      <Box
        aria-busy={isFetching || isFetchingLookups}
        sx={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          position: "relative",
        }}
      >
        {isInitialLoading ? (
          <Box
            role="status"
            aria-label="Cargando productos"
            sx={{ width: "100%", height: "100%" }}
          >
            <TableLoadingSkeleton
              columns={visibleColumns.length + 1}
              rows={10}
            />
          </Box>
        ) : isInitialError ? (
          <CustomGrid>
            <Box role="status" sx={{ textAlign: "center" }}>
              <ErrorMsg message="No se pudo cargar la lista de precios." />
              <Button
                sx={{ mt: 2 }}
                variant="contained"
                startIcon={<RefreshRounded />}
                onClick={() => void refetch()}
              >
                Reintentar
              </Button>
            </Box>
          </CustomGrid>
        ) : products.length === 0 ? (
          <CustomGrid>
            <Box role="status">
              <NoItems message="No se encontraron productos." />
            </Box>
          </CustomGrid>
        ) : (
          <TableVirtuoso
            aria-label="Lista de precios"
            data={products}
            components={virtuosoComponents}
            computeItemKey={(_index, product) => product.id}
            fixedHeaderContent={fixedHeaderContent}
            itemContent={itemContent}
            endReached={handleFetchNextPage}
            atBottomStateChange={setIsAtBottom}
            increaseViewportBy={200}
            style={{ height: "100%", width: "100%" }}
          />
        )}

        {products.length > 0 &&
          isAtBottom &&
          (isFetchingNextPage || isFetchNextPageError || !hasNextPage) && (
            <Box
              role="status"
              aria-live="polite"
              sx={{
                position: "absolute",
                right: 0,
                bottom: 0,
                left: 0,
                zIndex: 4,
                minHeight: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                px: 2,
                py: 0.75,
                borderTop: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              {isFetchingNextPage ? (
                <Typography variant="body2">
                  Cargando más productos…
                </Typography>
              ) : isFetchNextPageError ? (
                <>
                  <Typography variant="body2" color="error">
                    No se pudo cargar la página siguiente.
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<RefreshRounded />}
                    onClick={handleFetchNextPage}
                  >
                    Reintentar
                  </Button>
                </>
              ) : !hasNextPage ? (
                <Typography variant="body2" color="text.secondary">
                  No hay más productos.
                </Typography>
              ) : null}
            </Box>
          )}
      </Box>
    </PageContainer>
  );
}
