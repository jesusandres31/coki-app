import { ListResult } from "pocketbase";
import { UpdateItemReq } from "src/interfaces";
import { pb } from "src/libs";
import { GetList } from "src/types";
import {
  ClientsResponse,
  Create,
  InvoicesProductsResponse,
  InvoicesResponse,
  ProductsResponse,
  TypedPocketBase,
  Update,
  VInvoicesResponse,
} from "src/types/pocketbase-types";
import { ApiTag, mainApi, pbFilter, pbSort } from "./api";

const invoiceTag = ApiTag.Invoices;
const invoiceProductsTag = ApiTag.InvoicesProducts;
const invoicesViewTag = ApiTag.InvoicesView;
const clientsTag = ApiTag.Clients;
const productsTag = ApiTag.Products;
const typedPb = pb as TypedPocketBase;

interface CreateInvoiceItemReq {
  product: string;
  amount: number;
  unitPrice: number;
  discount: number;
}

export interface CreateInvoiceReq {
  client: string;
  date: string;
  discount: number;
  items: CreateInvoiceItemReq[];
}

const getItemTotal = (item: CreateInvoiceItemReq) =>
  Math.max(0, item.amount * item.unitPrice - item.discount);

export const invoiceApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getInvoicesView: build.query<ListResult<VInvoicesResponse>, GetList>({
      queryFn: async (_arg) => {
        const searchFilter = pbFilter(_arg.filter, ["date", "client"]);
        const res = await typedPb.collection("v_invoices").getList(
          _arg.page,
          _arg.perPage,
          {
            filter: searchFilter,
            sort: pbSort(_arg.order, _arg.orderBy),
          },
        );

        return { data: res };
      },
      providesTags: [invoicesViewTag],
    }),
    getInvoiceViewById: build.query<VInvoicesResponse, string>({
      queryFn: async (_arg) => {
        const res = await typedPb.collection("v_invoices").getOne(_arg);
        return { data: res };
      },
      providesTags: [invoicesViewTag],
    }),
    getClients: build.query<ClientsResponse[], void>({
      queryFn: async () => {
        const res = await typedPb.collection("clients").getFullList({
          filter: `deleted = ""`,
          sort: "+name",
        });
        return { data: res };
      },
      providesTags: [clientsTag],
    }),
    getProducts: build.query<ProductsResponse[], void>({
      queryFn: async () => {
        const res = await typedPb.collection("products").getFullList({
          filter: `deleted = ""`,
          sort: "+name",
        });
        return { data: res };
      },
      providesTags: [productsTag],
    }),
    createInvoice: build.mutation<
      {
        invoice: InvoicesResponse;
        invoiceProducts: InvoicesProductsResponse[];
      },
      CreateInvoiceReq
    >({
      queryFn: async (_arg) => {
        const invoiceProductsData = _arg.items.map((item) => ({
          ...item,
          total: getItemTotal(item),
        }));

        const subtotal = invoiceProductsData.reduce(
          (acc, item) => acc + item.total,
          0,
        );
        const invoiceTotal = Math.max(0, subtotal - _arg.discount);

        const invoicePayload: Create<"invoices"> = {
          client: _arg.client,
          date: _arg.date,
          discount: _arg.discount,
          total: invoiceTotal,
        };

        const invoice = await typedPb.collection("invoices").create(invoicePayload);

        const invoiceProducts = await Promise.all(
          invoiceProductsData.map((item) =>
            typedPb.collection("invoices_products").create({
              invoice: invoice.id,
              product: item.product,
              amount: item.amount,
              unit_price: item.unitPrice,
              discount: item.discount,
              total: item.total,
            }),
          ),
        );

        return { data: { invoice, invoiceProducts } };
      },
      invalidatesTags: [invoiceTag, invoiceProductsTag, invoicesViewTag],
    }),
    updateInvoice: build.mutation<
      InvoicesResponse,
      UpdateItemReq<Update<"invoices">>
    >({
      queryFn: async (_arg, _api, _options) => {
        const res = await typedPb.collection("invoices").update(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [invoiceTag, invoicesViewTag],
    }),
  }),
});

export const {
  useCreateInvoiceMutation,
  useGetClientsQuery,
  useGetInvoiceViewByIdQuery,
  useGetInvoicesViewQuery,
  useGetProductsQuery,
  useUpdateInvoiceMutation,
} = invoiceApi;
