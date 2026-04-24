import { AppRoutes } from "src/config";
import { IUIBreadcrumb } from "src/slices/uiSlice";

const baseConfigCrumb: IUIBreadcrumb = {
  label: "Configuración",
  to: AppRoutes.Config,
};

const baseProductTypesCrumb: IUIBreadcrumb = {
  label: "Tipos de producto",
  to: AppRoutes.ConfigProductTypes,
};

export const productTypesBreadcrumbFlow = {
  list: (): IUIBreadcrumb[] => [
    { label: "Configuración" },
    { label: "Tipos de producto" },
  ],
  create: (): IUIBreadcrumb[] => [
    baseConfigCrumb,
    baseProductTypesCrumb,
    { label: "Crear tipo de producto" },
  ],
  detail: (
    productTypeId: string,
    productTypeName?: string,
    isEditMode = false,
  ): IUIBreadcrumb[] => [
    baseConfigCrumb,
    baseProductTypesCrumb,
    {
      label: productTypeName
        ? `Tipo de producto ${productTypeName}`
        : `Tipo de producto ${productTypeId}`,
      to: `${AppRoutes.ConfigProductTypes}/${productTypeId}?mode=review`,
    },
    ...(isEditMode ? [{ label: "Editar" }] : []),
  ],
};
