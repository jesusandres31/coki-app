import { MeasureunitsResponse } from "src/types/pocketbase-types";
import {
  MEASURE_UNIT_DISPLAY_LABEL_BY_NAME,
  MeasureUnitName,
} from "src/config/measureunits";

export const normalizeMeasureUnitName = (name?: string | null) =>
  String(name || "").trim().toLowerCase().replace(/\.$/, "");

export const getMeasureUnitDisplayName = (
  unit?: Pick<MeasureunitsResponse, "name"> | null,
) => {
  const name = String(unit?.name || "-");
  return (
    MEASURE_UNIT_DISPLAY_LABEL_BY_NAME[
      normalizeMeasureUnitName(name) as MeasureUnitName
    ] || name
  );
};

export const buildMeasureUnitNameById = (
  measureUnits: MeasureunitsResponse[],
) =>
  new Map(
    measureUnits.map((unit) => [unit.id, getMeasureUnitDisplayName(unit)]),
  );

export const isKgMeasureUnitName = (name?: string | null) =>
  normalizeMeasureUnitName(name) === MeasureUnitName.Kilogram;
