import { BaseItem, ExpenseConcept } from ".";

export interface Expense extends BaseItem<{ expense_concept: ExpenseConcept }> {
  expense_concept: string;
  detail: string;
  amount: NumberOrEmpty;
  unit_price: NumberOrEmpty;
  total: NumberOrEmpty;
}

export type CreateExpenseReq = Pick<
  Expense,
  "expense_concept" | "detail" | "amount" | "unit_price" | "total"
>;
