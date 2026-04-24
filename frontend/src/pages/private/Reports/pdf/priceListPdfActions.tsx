import { pdf } from "@react-pdf/renderer";
import { PriceListPdfDocument } from "./PriceListPdfDocument";
import { PriceListPdfModel } from "./model";

const PDF_URL_REVOKE_DELAY_MS = 60_000;

export const createPriceListPdfBlob = async (report: PriceListPdfModel) =>
  pdf(<PriceListPdfDocument report={report} />).toBlob();

export const createPriceListPdfObjectUrl = async (report: PriceListPdfModel) =>
  URL.createObjectURL(await createPriceListPdfBlob(report));

export const openPriceListPdfTab = () => window.open("about:blank", "_blank");

export const openPriceListPdfInViewer = async (
  report: PriceListPdfModel,
  popup: Window,
) => {
  const pdfObjectUrl = await createPriceListPdfObjectUrl(report);

  if (popup.closed) {
    URL.revokeObjectURL(pdfObjectUrl);
    throw new Error("PopupClosed");
  }

  popup.location.replace(pdfObjectUrl);

  window.setTimeout(() => {
    URL.revokeObjectURL(pdfObjectUrl);
  }, PDF_URL_REVOKE_DELAY_MS);
};
