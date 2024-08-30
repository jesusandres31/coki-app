import { BaseItem, ExpenseConcept } from ".";

export interface Expense
  extends BaseItem<{ expense_concept: ExpenseConcept }>,
    CreateExpenseReq {}

export interface CreateExpenseReq {
  expense_concept: string;
  detail: string;
  amount: NumberOrEmpty;
  unit_price: NumberOrEmpty;
  total: NumberOrEmpty;
}
