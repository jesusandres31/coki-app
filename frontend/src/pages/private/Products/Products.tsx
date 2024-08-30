import { Product } from "src/interfaces";
import { Entity, IColumn } from "src/types";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { productApi } from "src/app/services/productService";
import { useUISelector } from "src/slices/ui/uiSlice";
import CreateOrUpdateProduct from "./content/CreateOrUpdateProduct";
import DeleteProducts from "./content/DeleteProducts";
import { formatDate, formatMoney } from "src/utils/format";

const COLUMNS: IColumn<Product>[] = [
  {
    minWidth: 150,
    label: "Nombre",
    id: "name",
    align: "left",
  },
  {
    minWidth: 100,
    label: "Precio Unit.",
    id: "unit_price",
  },
  {
    minWidth: 100,
    label: "Fecha Creación",
    id: "created",
    render: (item) => formatDate(item.created),
  },
];

const DEFAULT_ORDER_BY: keyof Product = "created";

const ENTITY: Entity = "products";

export default function Products() {
  const { actionModal, selectedItems } = useUISelector((state) => state.ui);
  const [getProducts, { data, isFetching, error }] =
    productApi.useLazyGetProductsQuery();

  const MODAL = {
    create: actionModal.create === ENTITY,
    update: actionModal.update === ENTITY,
    delete: actionModal.delete === ENTITY,
    label: selectedItems.length > 1 ? "Productos" : "Producto",
  };

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
      />
      <DeleteProducts open={MODAL.delete} label={MODAL.label} />
      <CreateOrUpdateProduct
        open={MODAL.create || MODAL.update}
        label={MODAL.label}
      />
    </>
  );
}
