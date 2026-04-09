import { AppRoutes } from "src/config";
import { IUIBreadcrumb } from "src/slices/uiSlice";

const baseInvoiceCrumb: IUIBreadcrumb = {
  label: "Facturación",
  to: AppRoutes.Invoices,
};

export const invoiceBreadcrumbFlow = {
  list: (): IUIBreadcrumb[] => [{ label: "Facturación" }],
  create: (): IUIBreadcrumb[] => [
    baseInvoiceCrumb,
    { label: "Crear factura" },
  ],
  detail: (invoiceId: string, isEditMode = false): IUIBreadcrumb[] => [
    baseInvoiceCrumb,
    { label: `Factura ${invoiceId}` },
    ...(isEditMode ? [{ label: "Editar" }] : []),
  ],
};
