import { AppRoutes } from "src/config";
import { IUIBreadcrumb } from "src/slices/uiSlice";

export const paymentsBreadcrumbFlow = {
  list: (): IUIBreadcrumb[] => [{ label: "Pagos", to: AppRoutes.Payments }],
  detail: (clientName?: string): IUIBreadcrumb[] => [
    { label: "Pagos", to: AppRoutes.Payments },
    { label: clientName || "Historial" },
  ],
};
