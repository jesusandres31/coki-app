import { pdf } from "@react-pdf/renderer";
import { DeliveryListPdfDocument } from "./DeliveryListPdfDocument";
import { DeliveryListPdfModel } from "./model";

const PDF_URL_REVOKE_DELAY_MS = 60_000;

export const createDeliveryPdfBlob = async (report: DeliveryListPdfModel) =>
  pdf(<DeliveryListPdfDocument report={report} />).toBlob();

export const createDeliveryPdfObjectUrl = async (report: DeliveryListPdfModel) =>
  URL.createObjectURL(await createDeliveryPdfBlob(report));

export const openDeliveryPdfTab = () => window.open("about:blank", "_blank");

export const openDeliveryPdfInViewer = async (
  report: DeliveryListPdfModel,
  popup: Window,
) => {
  const pdfObjectUrl = await createDeliveryPdfObjectUrl(report);

  if (popup.closed) {
    URL.revokeObjectURL(pdfObjectUrl);
    throw new Error("PopupClosed");
  }

  popup.location.replace(pdfObjectUrl);

  window.setTimeout(() => {
    URL.revokeObjectURL(pdfObjectUrl);
  }, PDF_URL_REVOKE_DELAY_MS);
};

