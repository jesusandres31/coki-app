import { ProductStore } from "src/interfaces";
import { IColumn } from "src/types";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { openModal, useUISelector } from "src/slices/ui/uiSlice";
import UpdateProductStock from "./content/UpdateProductStock";
import { formatDate, formatMoney } from "src/utils/format";
import { productStoreApi } from "src/app/services/productStoreService";
import { Typography } from "@mui/material";
import { ShoppingCartRounded } from "@mui/icons-material";
import { CustomButtonProps } from "src/components/common/DataGrid/content/utils";
import { useAppDispatch } from "src/app/store";
import { Collections } from "src/interfaces/pocketbase-types";

const COLUMNS: IColumn<ProductStore>[] = [
  {
    minWidth: 150,
    label: "Nombre",
    id: "product",
    align: "left",
    render: (item) => item.expand.product.name,
  },
  {
    minWidth: 100,
    label: "Stock",
    id: "stock",
    render: (item) => (
      <>
        {!item.stock ? (
          <Typography
            color="error"
            sx={{ fontSize: 12, textDecoration: "underline" }}
          >
            Sin Stock
          </Typography>
        ) : (
          item.stock
        )}
      </>
    ),
  },
  {
    minWidth: 100,
    label: "Precio Unit.",
    id: "product",
    render: (item) => formatMoney(item.expand?.product.unit_price),
  },
  {
    minWidth: 100,
    label: "Fecha Creación",
    id: "created",
    render: (item) => formatDate(item.created),
  },
];

const DEFAULT_ORDER_BY: keyof ProductStore = "created";

const ENTITY = Collections.ProductsStores;

export default function Products() {
  const dispatch = useAppDispatch();
  const { actionModal, selectedItems } = useUISelector((state) => state.ui);
  const [getProducts, { data, isFetching, error }] =
    productStoreApi.useLazyGetProductsStoresQuery();

  const MODAL = {
    create: actionModal.create === ENTITY,
    update: actionModal.update === ENTITY,
    delete: actionModal.delete === ENTITY,
    label: selectedItems.length > 1 ? "Productos" : "Producto",
  };

  const bulkActionForOne: CustomButtonProps[] = [
    {
      text: "Actualizar stock de producto",
      onClick: () => dispatch(openModal({ entity: ENTITY, action: "update" })),
      icon: <ShoppingCartRounded />,
    },
  ];

  return (
    <>
      <DataGrid
        data={data}
        error={error}
        isFetching={isFetching}
        columns={COLUMNS}
        defaultOrderBy={DEFAULT_ORDER_BY}
        fetchItemsFunc={getProducts}
        entity={ENTITY}
        bulkActionForOne={bulkActionForOne}
        disableCreateBtn
        disableDefaultOptBtn
      />
      <UpdateProductStock
        open={MODAL.create || MODAL.update}
        label={MODAL.label}
      />
    </>
  );
}
