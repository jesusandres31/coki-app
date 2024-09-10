import { BaseItem } from ".";

export interface ExpenseConcept extends BaseItem<{}> {
  name: string;
  detail: string;
  unit_price: NumberOrEmpty;
}

export type CreateExpenseConceptReq = Pick<
  ExpenseConcept,
  "name" | "detail" | "unit_price"
>;
