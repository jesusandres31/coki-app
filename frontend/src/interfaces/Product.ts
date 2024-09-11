import { ProductsResponse } from "./pocketbase-types";

export type Product = ProductsResponse;

export type CreateProductReq = Pick<Product, "name" | "unit_price">;
