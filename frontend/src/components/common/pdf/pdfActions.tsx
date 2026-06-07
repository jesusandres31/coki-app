import { pdf } from "@react-pdf/renderer";
import { ReactElement } from "react";

const PDF_URL_REVOKE_DELAY_MS = 60_000;

export const createPdfBlob = async (document: ReactElement) =>
  pdf(document).toBlob();

export const createPdfObjectUrl = async (document: ReactElement) =>
  URL.createObjectURL(await createPdfBlob(document));

export const openPdfTab = () => window.open("about:blank", "_blank");

export const openPdfInViewer = async (
  document: ReactElement,
  popup: Window,
) => {
  const pdfObjectUrl = await createPdfObjectUrl(document);

  if (popup.closed) {
    URL.revokeObjectURL(pdfObjectUrl);
    throw new Error("PopupClosed");
  }

  popup.location.replace(pdfObjectUrl);

  window.setTimeout(() => {
    URL.revokeObjectURL(pdfObjectUrl);
  }, PDF_URL_REVOKE_DELAY_MS);
};
