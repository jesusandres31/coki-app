import { Invoice, UpdateItemReq, UpsertInvoiceReq } from "src/interfaces";
import { ApiTag, mainApi } from "./api";
import { pb } from "src/libs";

const tag = ApiTag.InvoicesView;

export const invoiceApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    updateInvoice: build.mutation<Invoice, UpdateItemReq<UpsertInvoiceReq>>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(tag)
          .update<Invoice>(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
  }),
});
