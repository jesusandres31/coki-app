import { AppRoutes } from "src/config";
import { IUIBreadcrumb } from "src/slices/uiSlice";

const baseClientsCrumb: IUIBreadcrumb = {
  label: "Clientes",
  to: AppRoutes.Clients,
};

export const clientsBreadcrumbFlow = {
  list: (): IUIBreadcrumb[] => [{ label: "Clientes" }],
  create: (): IUIBreadcrumb[] => [
    baseClientsCrumb,
    { label: "Crear cliente" },
  ],
  detail: (
    clientId: string,
    clientName?: string,
    isEditMode = false,
  ): IUIBreadcrumb[] => [
    baseClientsCrumb,
    {
      label: clientName ? `Cliente ${clientName}` : `Cliente ${clientId}`,
      to: `${AppRoutes.Clients}/${clientId}?mode=review`,
    },
    ...(isEditMode ? [{ label: "Editar" }] : []),
  ],
};
