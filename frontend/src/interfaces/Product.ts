import { Store } from ".";
import { ProductsResponse, ProductsStoresResponse } from "./pocketbase-types";

// products
export type Product = ProductsResponse;

export type CreateProductReq = Pick<Product, "name" | "unit_price">;

// products_stores
export type ProductStore = ProductsStoresResponse<{
  product: Product;
  store: Store;
}>;

export type CreateProductStoreReq = Pick<
  ProductStore,
  "product" | "store" | "stock"
>;
