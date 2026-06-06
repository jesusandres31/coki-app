import { AppRoutes } from "src/config";
import { IUIBreadcrumb } from "src/slices/uiSlice";

export const generalSettingsBreadcrumbFlow = {
  page: (): IUIBreadcrumb[] => [
    {
      label: "Configuración",
      to: AppRoutes.Config,
    },
    {
      label: "General",
      to: AppRoutes.ConfigGeneralSettings,
    },
  ],
};
