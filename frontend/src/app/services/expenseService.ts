import { CreateExpenseReq, Expense, UpdateItemReq } from "src/interfaces";
import { ApiTag, FLAG, mainApi, pbFilter, pbSort } from "./api";
import { pb } from "src/libs";
import { ListResult } from "pocketbase";
import { GetList } from "src/types";

const tag = ApiTag.Expenses;
const expand = "expense_concept";

export const expenseApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getExpenses: build.query<ListResult<Expense>, GetList>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(tag)
          .getList<Expense>(_arg.page, _arg.perPage, {
            expand,
            sort: pbSort(_arg.order, _arg.orderBy),
            filter: pbFilter(_arg.filter, [
              "detail",
              "amount",
              "unit_price",
              "total",
              "expense_concept.name",
            ]),
          });
        return { data: res };
      },
      providesTags: [tag],
    }),
    getExpense: build.query<Expense, string>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).getOne<Expense>(_arg, { expand });
        return { data: res };
      },
      providesTags: [tag],
    }),
    createExpense: build.mutation<Expense, CreateExpenseReq>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).create<Expense>(_arg);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    updateExpense: build.mutation<Expense, UpdateItemReq<CreateExpenseReq>>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(tag)
          .update<Expense>(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    deleteExpense: build.mutation<PromiseSettledResult<void>[], string[]>({
      queryFn: async (_arg, _api, _options) => {
        const items = Array.isArray(_arg) ? _arg : [_arg];
        const res = await Promise.allSettled(
          items.map(async (id) => {
            await pb.collection(tag).update<Expense>(id, FLAG.delete);
          })
        );
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
  }),
});
