import { Product, Store } from ".";
import { ProductsStoresResponse } from "./pocketbase-types";

// products_stores
export type ProductStore = ProductsStoresResponse<{
  product: Product;
  store: Store;
}>;

export type CreateProductStoreReq = Pick<
  ProductStore,
  "product" | "store" | "stock"
>;
