import { BaseItem, Field } from ".";

export interface Ball extends BaseItem<{ field: Field }>, CreateBallReq {}

export interface CreateBallReq {
  field: string;
  name: string;
  detail: string;
}
