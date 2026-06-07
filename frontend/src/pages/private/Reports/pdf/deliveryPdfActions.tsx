import {
  createPdfBlob,
  createPdfObjectUrl,
  openPdfInViewer,
  openPdfTab,
} from "src/components/common/pdf";
import { DeliveryListPdfDocument } from "./DeliveryListPdfDocument";
import { DeliveryListPdfModel } from "./model";

export const createDeliveryPdfBlob = async (report: DeliveryListPdfModel) =>
  createPdfBlob(<DeliveryListPdfDocument report={report} />);

export const createDeliveryPdfObjectUrl = async (report: DeliveryListPdfModel) =>
  createPdfObjectUrl(<DeliveryListPdfDocument report={report} />);

export const openDeliveryPdfTab = openPdfTab;

export const openDeliveryPdfInViewer = async (
  report: DeliveryListPdfModel,
  popup: Window,
) => openPdfInViewer(<DeliveryListPdfDocument report={report} />, popup);

