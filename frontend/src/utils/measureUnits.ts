import { MeasureunitsResponse } from "src/types/pocketbase-types";

export const getMeasureUnitDisplayName = (
  unit?: Pick<MeasureunitsResponse, "name"> | null,
) => {
  const name = String(unit?.name || "-");
  return name.trim().toLowerCase() === "uni" ? "Ud." : name;
};

export const buildMeasureUnitNameById = (
  measureUnits: MeasureunitsResponse[],
) =>
  new Map(
    measureUnits.map((unit) => [unit.id, getMeasureUnitDisplayName(unit)]),
  );
