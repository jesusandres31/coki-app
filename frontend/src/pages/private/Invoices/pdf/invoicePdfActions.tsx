import { pdf } from "@react-pdf/renderer";
import { InvoicePdfDocument } from "./InvoicePdfDocument";
import { InvoicePdfModel } from "./model";

const PDF_URL_REVOKE_DELAY_MS = 60_000;

export const createInvoicePdfBlob = async (invoice: InvoicePdfModel) =>
  pdf(<InvoicePdfDocument invoice={invoice} />).toBlob();

export const createInvoicePdfObjectUrl = async (invoice: InvoicePdfModel) =>
  URL.createObjectURL(await createInvoicePdfBlob(invoice));

export const openInvoicePdfTab = () => window.open("about:blank", "_blank");

export const openInvoicePdfInViewer = async (
  invoice: InvoicePdfModel,
  popup: Window,
) => {
  const pdfObjectUrl = await createInvoicePdfObjectUrl(invoice);

  if (popup.closed) {
    URL.revokeObjectURL(pdfObjectUrl);
    throw new Error("PopupClosed");
  }

  popup.location.replace(pdfObjectUrl);

  window.setTimeout(() => {
    URL.revokeObjectURL(pdfObjectUrl);
  }, PDF_URL_REVOKE_DELAY_MS);
};
