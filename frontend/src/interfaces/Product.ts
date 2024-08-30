import { BaseItem, Canteen } from ".";

// products
export interface Product extends BaseItem<{}>, CreateProductReq {}

export interface CreateProductReq {
  name: string;
  unit_price: NumberOrEmpty;
}

// products_canteens
export interface ProductCanteen
  extends BaseItem<{ product: Product; canteen: Canteen }>,
    CreateProductCanteenReq {}

export interface CreateProductCanteenReq {
  product: string;
  canteen: string;
  stock: NumberOrEmpty;
}
