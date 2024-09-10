import { ExpenseConceptsResponse, ExpensesResponse } from "./pocketbase-types";

export type Expense = ExpensesResponse<{
  expense_concept: ExpenseConceptsResponse;
}>;

export type CreateExpenseReq = Pick<
  Expense,
  "expense_concept" | "detail" | "amount" | "unit_price" | "total"
>;
