import {
  createPdfBlob,
  createPdfObjectUrl,
  openPdfInViewer,
  openPdfTab,
} from "src/components/common/pdf";
import { PriceListPdfDocument } from "./PriceListPdfDocument";
import { PriceListPdfModel } from "./model";

export const createPriceListPdfBlob = async (report: PriceListPdfModel) =>
  createPdfBlob(<PriceListPdfDocument report={report} />);

export const createPriceListPdfObjectUrl = async (report: PriceListPdfModel) =>
  createPdfObjectUrl(<PriceListPdfDocument report={report} />);

export const openPriceListPdfTab = openPdfTab;

export const openPriceListPdfInViewer = async (
  report: PriceListPdfModel,
  popup: Window,
) => openPdfInViewer(<PriceListPdfDocument report={report} />, popup);
