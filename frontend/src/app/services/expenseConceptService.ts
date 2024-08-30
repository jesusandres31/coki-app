import {
  ExpenseConcept,
  CreateExpenseConceptReq,
  UpdateItemReq,
} from "src/interfaces";
import { ApiTag, FLAG, mainApi, pbFilter, pbSort } from "./api";
import { pb } from "src/libs";
import { ListResult } from "pocketbase";
import { GetList } from "src/types";

const tag = ApiTag.ExpenseConcepts;

export const expenseConceptApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getExpenseConcepts: build.query<ListResult<ExpenseConcept>, GetList>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(tag)
          .getList<ExpenseConcept>(_arg.page, _arg.perPage, {
            sort: pbSort(_arg.order, _arg.orderBy),
            filter: pbFilter(_arg.filter, ["name", "detail", "unit_price"]),
          });
        return { data: res };
      },
      providesTags: [tag],
    }),
    getExpenseConcept: build.query<ExpenseConcept, string>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).getOne<ExpenseConcept>(_arg);
        return { data: res };
      },
      providesTags: [tag],
    }),
    createExpenseConcept: build.mutation<
      ExpenseConcept,
      CreateExpenseConceptReq
    >({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).create<ExpenseConcept>(_arg);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    updateExpenseConcept: build.mutation<
      ExpenseConcept,
      UpdateItemReq<CreateExpenseConceptReq>
    >({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(tag)
          .update<ExpenseConcept>(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    deleteExpenseConcept: build.mutation<
      PromiseSettledResult<void>[],
      string[]
    >({
      queryFn: async (_arg, _api, _options) => {
        const items = Array.isArray(_arg) ? _arg : [_arg];
        const res = await Promise.allSettled(
          items.map(async (id) => {
            await pb.collection(tag).update<ExpenseConcept>(id, FLAG.delete);
          })
        );
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
  }),
});
