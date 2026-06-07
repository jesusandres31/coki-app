import { MeasureunitsResponse } from "src/types/pocketbase-types";

export const getMeasureUnitDisplayName = (
  unit?: Pick<MeasureunitsResponse, "name"> | null,
) => String(unit?.name || "-");

export const buildMeasureUnitNameById = (
  measureUnits: MeasureunitsResponse[],
) =>
  new Map(
    measureUnits.map((unit) => [unit.id, getMeasureUnitDisplayName(unit)]),
  );
