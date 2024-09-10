import { ExpenseConceptsResponse } from "./pocketbase-types";

export type ExpenseConcept = ExpenseConceptsResponse;

export type CreateExpenseConceptReq = Pick<
  ExpenseConcept,
  "name" | "detail" | "unit_price"
>;
