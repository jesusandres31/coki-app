import { ListResult } from "pocketbase";
import dayjs from "dayjs";
import { pb } from "src/libs";
import { GetList } from "src/types";
import {
  ClientsResponse,
  Create,
  InvoicestatesResponse,
  InvoicesProductsResponse,
  InvoicesResponse,
  MeasureunitsResponse,
  ProductsResponse,
  TypedPocketBase,
  Update,
  VInvoicesResponse,
} from "src/types/pocketbase-types";
import { ApiTag, mainApi, pbFilter, pbSort } from "./api";

const invoiceTag = ApiTag.Invoices;
const invoiceProductsTag = ApiTag.InvoicesProducts;
const invoicesViewTag = ApiTag.InvoicesView;
const invoiceStatesTag = ApiTag.InvoiceStates;
const clientsTag = ApiTag.Clients;
const productsTag = ApiTag.Products;
const measureUnitsTag = ApiTag.MeasureUnits;
const typedPb = pb as TypedPocketBase;
const MAX_DISCOUNT_PERCENT = 100;
const DEFAULT_INVOICE_STATE = "open";

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
  state?: "draft" | "open" | "void";
}

export interface UpdateInvoiceReq {
  id: string;
  data: Update<"invoices">;
  items?: CreateInvoiceItemReq[];
}

export interface GetInvoicesByDateRangeReq {
  from: string;
  to: string;
}

interface UpdateClientReq {
  id: string;
  data: Update<"clients">;
}

interface CreateClientReq {
  data: Create<"clients">;
}

interface UpdateProductReq {
  id: string;
  data: Update<"products">;
}

interface CreateProductReq {
  data: Create<"products">;
}

const normalizeDiscountPercent = (value: number) =>
  Math.min(MAX_DISCOUNT_PERCENT, Math.max(0, Number(value || 0)));

const getItemTotal = (item: CreateInvoiceItemReq) => {
  const discountPercent = normalizeDiscountPercent(item.discount);
  return Math.max(
    0,
    item.amount * item.unitPrice * (1 - discountPercent / 100),
  );
};

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
    getInvoicesByDateRange: build.query<
      VInvoicesResponse[],
      GetInvoicesByDateRangeReq
    >({
      queryFn: async (_arg) => {
        const normalizedFrom = dayjs(_arg.from).format("YYYY-MM-DD");
        const normalizedTo = dayjs(_arg.to).format("YYYY-MM-DD");
        const toExclusive = dayjs(normalizedTo).add(1, "day").format("YYYY-MM-DD");
        const from = normalizedFrom.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        const to = toExclusive.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        // Use an exclusive upper bound to include the full "to" day even when `date` has time.
        const filter = `deleted = "" && date >= "${from}" && date < "${to}"`;
        const res = await typedPb.collection("v_invoices").getFullList({
          filter,
          sort: "+date",
          requestKey: null,
        });

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
    getInvoiceStates: build.query<InvoicestatesResponse[], void>({
      queryFn: async () => {
        const res = await typedPb.collection("invoicestates").getFullList({
          sort: "+name",
        });
        return { data: res };
      },
      providesTags: [invoiceStatesTag],
    }),
    getClientsList: build.query<ListResult<ClientsResponse>, GetList>({
      queryFn: async (_arg) => {
        const res = await typedPb.collection("clients").getList(
          _arg.page,
          _arg.perPage,
          {
            filter: pbFilter(_arg.filter, ["name", "address", "phone"]),
            sort: pbSort(_arg.order, _arg.orderBy),
          },
        );
        return { data: res };
      },
      providesTags: [clientsTag],
    }),
    getClientById: build.query<ClientsResponse, string>({
      queryFn: async (_arg) => {
        const res = await typedPb.collection("clients").getOne(_arg);
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
    getMeasureUnits: build.query<MeasureunitsResponse[], void>({
      queryFn: async () => {
        const res = await typedPb.collection("measureunits").getFullList({
          filter: `deleted = ""`,
          sort: "+name",
        });
        return { data: res };
      },
      providesTags: [measureUnitsTag],
    }),
    getProductsList: build.query<ListResult<ProductsResponse>, GetList>({
      queryFn: async (_arg) => {
        const res = await typedPb.collection("products").getList(
          _arg.page,
          _arg.perPage,
          {
            filter: pbFilter(_arg.filter, ["name"]),
            sort: pbSort(_arg.order, _arg.orderBy),
          },
        );
        return { data: res };
      },
      providesTags: [productsTag],
    }),
    getProductById: build.query<ProductsResponse, string>({
      queryFn: async (_arg) => {
        const res = await typedPb.collection("products").getOne(_arg);
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
        const invoiceDiscountPercent = normalizeDiscountPercent(_arg.discount);
        const invoiceTotal = Math.max(
          0,
          subtotal * (1 - invoiceDiscountPercent / 100),
        );

        const invoiceStateName = _arg.state || DEFAULT_INVOICE_STATE;

        const invoicePayload: Create<"invoices"> = {
          client: _arg.client,
          date: _arg.date,
          discount: invoiceDiscountPercent,
          total: invoiceTotal,
          state: (
            await typedPb
              .collection("invoicestates")
              .getFirstListItem(`name = "${invoiceStateName}"`)
          ).id,
        };

        const invoice = await typedPb.collection("invoices").create(invoicePayload);

        const invoiceProducts: InvoicesProductsResponse[] = [];
        for (const item of invoiceProductsData) {
          const createdItem = await typedPb.collection("invoices_products").create({
            invoice: invoice.id,
            product: item.product,
            amount: item.amount,
            unit_price: item.unitPrice,
            discount: normalizeDiscountPercent(item.discount),
            total: item.total,
          });
          invoiceProducts.push(createdItem);
        }

        return { data: { invoice, invoiceProducts } };
      },
      invalidatesTags: [invoiceTag, invoiceProductsTag, invoicesViewTag],
    }),
    updateInvoice: build.mutation<InvoicesResponse, UpdateInvoiceReq>({
      queryFn: async (_arg, _api, _options) => {
        const currentInvoice = await typedPb.collection("invoices").getOne(_arg.id);

        const invoiceDiscountPercent =
          _arg.data.discount === undefined
            ? normalizeDiscountPercent(Number(currentInvoice.discount ?? 0))
            : normalizeDiscountPercent(Number(_arg.data.discount));

        let subtotal = 0;

        if (_arg.items) {
          const existingItems = await typedPb
            .collection("invoices_products")
            .getFullList({
              filter: `invoice = "${_arg.id}"`,
            });

          await Promise.all(
            existingItems.map((item) =>
              typedPb.collection("invoices_products").delete(item.id),
            ),
          );

          const nextItems = _arg.items.map((item) => ({
            ...item,
            total: getItemTotal(item),
          }));

          subtotal = nextItems.reduce((acc, item) => acc + item.total, 0);

          for (const item of nextItems) {
            await typedPb.collection("invoices_products").create({
              invoice: _arg.id,
              product: item.product,
              amount: item.amount,
              unit_price: item.unitPrice,
              discount: normalizeDiscountPercent(item.discount),
              total: item.total,
            });
          }
        } else {
          const existingItems = await typedPb
            .collection("invoices_products")
            .getFullList({
              filter: `invoice = "${_arg.id}"`,
            });

          subtotal = existingItems.reduce(
            (acc, item) => acc + Number(item.total ?? 0),
            0,
          );
        }

        const total = Math.max(0, subtotal * (1 - invoiceDiscountPercent / 100));

        const res = await typedPb.collection("invoices").update(_arg.id, {
          ..._arg.data,
          discount: invoiceDiscountPercent,
          total,
        });
        return { data: res };
      },
      invalidatesTags: [invoiceTag, invoiceProductsTag, invoicesViewTag],
    }),
    updateClient: build.mutation<ClientsResponse, UpdateClientReq>({
      queryFn: async (_arg) => {
        const res = await typedPb.collection("clients").update(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [clientsTag],
    }),
    createClient: build.mutation<ClientsResponse, CreateClientReq>({
      queryFn: async (_arg) => {
        const res = await typedPb.collection("clients").create(_arg.data);
        return { data: res };
      },
      invalidatesTags: [clientsTag],
    }),
    updateProduct: build.mutation<ProductsResponse, UpdateProductReq>({
      queryFn: async (_arg) => {
        const res = await typedPb
          .collection("products")
          .update(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [productsTag],
    }),
    createProduct: build.mutation<ProductsResponse, CreateProductReq>({
      queryFn: async (_arg) => {
        const res = await typedPb.collection("products").create(_arg.data);
        return { data: res };
      },
      invalidatesTags: [productsTag],
    }),
  }),
});

export const {
  useCreateClientMutation,
  useCreateInvoiceMutation,
  useCreateProductMutation,
  useGetClientByIdQuery,
  useGetClientsQuery,
  useGetClientsListQuery,
  useGetInvoiceViewByIdQuery,
  useGetInvoicesByDateRangeQuery,
  useGetInvoiceStatesQuery,
  useGetInvoicesViewQuery,
  useGetMeasureUnitsQuery,
  useGetProductByIdQuery,
  useGetProductsQuery,
  useGetProductsListQuery,
  useUpdateClientMutation,
  useUpdateInvoiceMutation,
  useUpdateProductMutation,
} = invoiceApi;
