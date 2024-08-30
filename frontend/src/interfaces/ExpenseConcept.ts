import { BaseItem } from ".";

export interface ExpenseConcept extends BaseItem<{}>, CreateExpenseConceptReq {}

export interface CreateExpenseConceptReq {
  name: string;
  detail: string;
  unit_price: NumberOrEmpty;
}
