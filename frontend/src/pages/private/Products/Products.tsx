import { useEffect, useMemo, useState } from "react";
import DeleteEntityDialog from "src/components/common/DeleteEntityDialog";
import { useDeleteProductMutation } from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import {
  resetBreadcrumbs,
  setBreadcrumbs,
  setSnackbar,
} from "src/slices/uiSlice";
import { useRouter } from "src/hooks";
import { AppRoutes } from "src/config";
import { ProductsResponse } from "src/types/pocketbase-types";
import { DataGridRowAction } from "src/types";
import { productsBreadcrumbFlow } from "./breadcrumbFlow";
import { buildCrudRowActions } from "../crudListUtils";
import ProductListGrid from "./ProductListGrid";

export default function Products() {
  const dispatch = useAppDispatch();
  const { handleGoTo, handleGoToFromCurrent } = useRouter();
  const [productToDelete, setProductToDelete] =
    useState<ProductsResponse | null>(null);
  useEffect(() => {
    dispatch(setBreadcrumbs(productsBreadcrumbFlow.list()));
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch]);

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete.id).unwrap();
      dispatch(
        setSnackbar({
          message: "Producto eliminado satisfactoriamente.",
          type: "success",
        }),
      );
      setProductToDelete(null);
    } catch {
      dispatch(
        setSnackbar({
          message: "No se pudo eliminar el producto.",
          type: "error",
        }),
      );
    }
  };

  const rowActions: DataGridRowAction[] = useMemo(
    () =>
      buildCrudRowActions<ProductsResponse>({
        entityLabel: "producto",
        baseRoute: AppRoutes.Products,
        handleGoTo: (path) => handleGoToFromCurrent(path, "Productos"),
        onDelete: setProductToDelete,
      }),
    [handleGoToFromCurrent],
  );

  return (
    <>
      <ProductListGrid
        rowActions={rowActions}
        createAction={{
          label: "Crear producto",
          onClick: () => handleGoTo(AppRoutes.ProductsNew),
        }}
      />
      <DeleteEntityDialog
        open={Boolean(productToDelete)}
        title="Eliminar producto"
        message={`¿Confirmás eliminar el producto "${productToDelete?.name || ""}"?`}
        isDeleting={isDeleting}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
