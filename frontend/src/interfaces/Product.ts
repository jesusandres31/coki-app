import { MeasureUnitsResponse, ProductsResponse } from "./pocketbase-types";

export type Product = ProductsResponse<{
  measure_unit: MeasureUnitsResponse;
}>;

export type CreateProductReq = Pick<
  Product,
  "name" | "unit_price" | "measure_unit"
>;
