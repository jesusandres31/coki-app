import { BaseItem, Store } from ".";

// products
export interface Product extends BaseItem<{}> {
  name: string;
  unit_price: NumberOrEmpty;
}

export type CreateProductReq = Pick<Product, "name" | "unit_price">;

// products_stores
export interface ProductStore
  extends BaseItem<{ product: Product; store: Store }> {
  product: string;
  store: string;
  stock: NumberOrEmpty;
}

export type CreateProductStoreReq = Pick<
  ProductStore,
  "product" | "store" | "stock"
>;
