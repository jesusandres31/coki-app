import { CreateInvoiceReq, Invoice, UpdateItemReq } from "src/interfaces";
import {
  ApiTag,
  ApiView,
  FLAG,
  getCurrent,
  mainApi,
  pbFilter,
  pbSort,
} from "./api";
import { pb } from "src/libs";
import { ListResult } from "pocketbase";
import { GetList } from "src/types";

const tag = ApiTag.Invoices;
const view = ApiView.Invoices;

export const invoiceApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getInvoices: build.query<ListResult<Invoice>, GetList>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(view)
          .getList<Invoice>(_arg.page, _arg.perPage, {
            sort: pbSort(_arg.order, _arg.orderBy),
            filter: pbFilter(_arg.filter, ["client.name"]) + getCurrent.Store(),
          });
        return { data: res };
      },
      providesTags: [tag, FLAG.refetch],
    }),
    getInvoice: build.query<Invoice, string>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).getOne<Invoice>(_arg);
        return { data: res };
      },
      providesTags: [tag],
    }),
    createInvoice: build.mutation<Invoice, CreateInvoiceReq>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).create<Invoice>(_arg);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    updateInvoice: build.mutation<Invoice, UpdateItemReq<CreateInvoiceReq>>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(tag)
          .update<Invoice>(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    deleteInvoice: build.mutation<PromiseSettledResult<void>[], string[]>({
      queryFn: async (_arg, _api, _options) => {
        const items = Array.isArray(_arg) ? _arg : [_arg];
        const res = await Promise.allSettled(
          items.map(async (id) => {
            await pb.collection(tag).update<Invoice>(id, FLAG.delete);
          })
        );
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
  }),
});
