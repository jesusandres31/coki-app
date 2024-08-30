import { BaseItem } from ".";

export interface Canteen
  extends BaseItem<{ location: Location }>,
    CreateCanteenReq {}

export interface CreateCanteenReq {
  location: string;
  name: string;
}
