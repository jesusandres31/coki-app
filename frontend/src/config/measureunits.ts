// These values match the `name` field in the PocketBase `measureunits` collection.
export enum MeasureUnitName {
  Kilogram = "kg",
  Unit = "uni",
}

export const MEASURE_UNIT_DISPLAY_LABEL_BY_NAME: Record<
  MeasureUnitName,
  string
> = {
  [MeasureUnitName.Kilogram]: "Kg.",
  [MeasureUnitName.Unit]: "Ud.",
};
