import { ListResult } from "pocketbase";
import { UpdateItemReq } from "src/interfaces";
import { pb } from "src/libs";
import { GetList } from "src/types";
import {
  TypedPocketBase,
  Update,
  InvoicesResponse,
  VInvoicesResponse,
} from "src/types/pocketbase-types";
import { ApiTag, mainApi, pbSort } from "./api";

const invoiceTag = ApiTag.Invoices;
const invoicesViewTag = ApiTag.InvoicesView;
const typedPb = pb as TypedPocketBase;

export const invoiceApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getInvoicesView: build.query<ListResult<VInvoicesResponse>, GetList>({
      queryFn: async (_arg) => {
        const res = await typedPb.collection("v_invoices").getList(
          _arg.page,
          _arg.perPage,
          {
            filter: _arg.filter,
            sort: pbSort(_arg.order, _arg.orderBy),
          },
        );

        return { data: res };
      },
      providesTags: [invoicesViewTag],
    }),
    updateInvoice: build.mutation<InvoicesResponse, UpdateItemReq<Update<"invoices">>>({
      queryFn: async (_arg, _api, _options) => {
        const res = await typedPb.collection("invoices").update(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [invoiceTag, invoicesViewTag],
    }),
  }),
});

export const { useGetInvoicesViewQuery, useUpdateInvoiceMutation } = invoiceApi;
