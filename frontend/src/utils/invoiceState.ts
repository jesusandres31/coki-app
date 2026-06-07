import { getRecordDisplayName } from "./data";

const stateLabelByName: Record<string, string> = {
  open: "Confirmada",
  draft: "Borrador",
  void: "Cancelada",
};

export const getInvoiceStateName = (stateValue: unknown) =>
  getRecordDisplayName(stateValue, "").toLowerCase().trim();

export const getInvoiceStateLabel = (stateValue: unknown) => {
  const stateName = getInvoiceStateName(stateValue);
  return stateLabelByName[stateName] || stateName || "-";
};
