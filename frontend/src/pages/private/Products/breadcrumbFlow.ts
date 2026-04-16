import { AppRoutes } from "src/config";
import { IUIBreadcrumb } from "src/slices/uiSlice";

const baseProductsCrumb: IUIBreadcrumb = {
  label: "Productos",
  to: AppRoutes.Products,
};

export const productsBreadcrumbFlow = {
  list: (): IUIBreadcrumb[] => [{ label: "Productos" }],
  create: (): IUIBreadcrumb[] => [
    baseProductsCrumb,
    { label: "Crear producto" },
  ],
  detail: (
    productId: string,
    productName?: string,
    isEditMode = false,
  ): IUIBreadcrumb[] => [
    baseProductsCrumb,
    {
      label: productName ? `Producto ${productName}` : `Producto ${productId}`,
      to: `${AppRoutes.Products}/${productId}?mode=review`,
    },
    ...(isEditMode ? [{ label: "Editar" }] : []),
  ],
};
