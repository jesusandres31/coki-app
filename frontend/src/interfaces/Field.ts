import { BaseItem, Location } from ".";

export interface Field
  extends BaseItem<{ location: Location }>,
    UpdateFieldReq {}

export interface UpdateFieldReq {
  location: string;
  name: string;
  price_per_hour: NumberOrEmpty;
}
