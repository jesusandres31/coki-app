import { BaseItem, Store } from ".";

// products
export interface Product extends BaseItem<{}>, CreateProductReq {}

export interface CreateProductReq {
  name: string;
  unit_price: NumberOrEmpty;
}

// products_stores
export interface ProductStore
  extends BaseItem<{ product: Product; store: Store }>,
    CreateProductStoreReq {}

export interface CreateProductStoreReq {
  product: string;
  store: string;
  stock: NumberOrEmpty;
}
