import {
  createPdfBlob,
  createPdfObjectUrl,
  openPdfInViewer,
  openPdfTab,
} from "src/components/common/pdf";
import { InvoicePdfDocument } from "./InvoicePdfDocument";
import { InvoicePdfModel } from "./model";

export const createInvoicePdfBlob = async (invoice: InvoicePdfModel) =>
  createPdfBlob(<InvoicePdfDocument invoice={invoice} />);

export const createInvoicePdfObjectUrl = async (invoice: InvoicePdfModel) =>
  createPdfObjectUrl(<InvoicePdfDocument invoice={invoice} />);

export const openInvoicePdfTab = openPdfTab;

export const openInvoicePdfInViewer = async (
  invoice: InvoicePdfModel,
  popup: Window,
) => openPdfInViewer(<InvoicePdfDocument invoice={invoice} />, popup);
