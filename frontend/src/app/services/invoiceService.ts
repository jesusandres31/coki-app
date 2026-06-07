import { ListResult } from "pocketbase";
import dayjs from "dayjs";
import { pb } from "src/libs";
import { GetList } from "src/types";
import {
  ClientsResponse,
  ConfigsResponse,
  Create,
  InvoicestatesResponse,
  InvoicesProductsResponse,
  InvoicesResponse,
  MeasureunitsResponse,
  PaymentAccountMovementTypesResponse,
  PaymentAccountMovementsResponse,
  ProductTypesResponse,
  ProductsResponse,
  TypedPocketBase,
  Update,
  VInvoicesResponse,
} from "src/types/pocketbase-types";
import { configKey } from "src/config";
import { ApiTag, FLAG, mainApi, pbFilter, pbSort } from "./api";

const invoiceTag = ApiTag.Invoices;
const invoiceProductsTag = ApiTag.InvoicesProducts;
const invoicesViewTag = ApiTag.InvoicesView;
const invoiceStatesTag = ApiTag.InvoiceStates;
const clientsTag = ApiTag.Clients;
const productsTag = ApiTag.Products;
const productTypesTag = ApiTag.ProductTypes;
const configsTag = ApiTag.Configs;
const measureUnitsTag = ApiTag.MeasureUnits;
const paymentAccountMovementsTag = ApiTag.PaymentAccountMovements;
const paymentAccountMovementTypesTag = ApiTag.PaymentAccountMovementTypes;
const typedPb = pb as TypedPocketBase;
const MAX_DISCOUNT_PERCENT = 100;
const pbNoAutoCancelOptions = { requestKey: null } as const;

export type PaymentAccountMovementTypeName = "payment" | "debt" | "adjustment";

interface CreateInvoiceItemReq {
  id?: string;
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
  paidNow?: boolean;
  paidAmount?: number;
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

export interface GetLastProductPriceForClientReq {
  clientId: string;
  productId: string;
  excludeInvoiceId?: string;
}

export interface LastProductPriceForClient {
  unitPrice: number;
}

interface UpdateClientReq {
  id: string;
  data: Update<"clients">;
}

interface CreateClientReq {
  data: Create<"clients">;
}

export interface CreatePaymentAccountMovementReq {
  clientId: string;
  typeId?: string;
  typeName: PaymentAccountMovementTypeName;
  amount: number;
  description?: string;
}

export interface CreatePaymentAccountMovementRes {
  movement: PaymentAccountMovementsResponse;
  client: ClientsResponse;
}

export interface CreateInvoiceRes {
  invoice: InvoicesResponse;
  invoiceProducts: InvoicesProductsResponse[];
  paymentMovements?: PaymentAccountMovementsResponse[];
}

export type PaymentAccountMovementExpand = {
  client?: ClientsResponse;
  type?: PaymentAccountMovementTypesResponse;
};

export type PaymentAccountMovementWithExpand =
  PaymentAccountMovementsResponse<PaymentAccountMovementExpand>;

interface UpdateProductReq {
  id: string;
  data: Update<"products">;
}

interface CreateProductReq {
  data: Create<"products">;
}

interface UpdateProductTypeReq {
  id: string;
  data: Update<"product_types">;
}

interface CreateProductTypeReq {
  data: Create<"product_types">;
}

interface UpdateConfigReq {
  id: string;
  data: Update<"configs">;
}

const normalizeDiscountPercent = (value: number) =>
  Math.min(MAX_DISCOUNT_PERCENT, Math.max(0, Number(value || 0)));

const escapePbFilterValue = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').trim();

const parseInvoiceSearchDate = (value: string) => {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (!match) return null;

  const [, dayValue, monthValue, yearValue] = match;
  const day = Number(dayValue);
  const month = Number(monthValue);
  const year = 2000 + Number(yearValue);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${monthValue}-${dayValue}`;
};

const buildInvoicesListFilter = (filter: string | undefined) => {
  if (!filter) return `deleted = ""`;

  const safeFilter = escapePbFilterValue(filter);
  if (!safeFilter) return `deleted = ""`;

  const searchFilters = [`client.name ~ "${safeFilter}"`];
  const searchDate = parseInvoiceSearchDate(safeFilter);

  if (searchDate) {
    const nextDate = dayjs(searchDate).add(1, "day").format("YYYY-MM-DD");
    searchFilters.push(`(date >= "${searchDate}" && date < "${nextDate}")`);
  }

  return `(${searchFilters.join(" || ")}) && deleted = ""`;
};

const getItemTotal = (item: CreateInvoiceItemReq) => {
  const discountPercent = normalizeDiscountPercent(item.discount);
  return Math.max(
    0,
    item.amount * item.unitPrice * (1 - discountPercent / 100),
  );
};

const buildPaymentAccountMovementsListFilter = (filter: string | undefined) => {
  if (!filter) return "";

  const safeFilter = escapePbFilterValue(filter);
  if (!safeFilter) return "";

  return [
    `client.name ~ "${safeFilter}"`,
    `type.name ~ "${safeFilter}"`,
    `description ~ "${safeFilter}"`,
  ].join(" || ");
};

const softDeletePayload = FLAG.delete as unknown as Update<
  "clients" | "invoices" | "invoices_products" | "product_types" | "products"
>;
const buildInvoiceSoftDeletePayload = (deletedAt: string) =>
  ({
    deleted: deletedAt,
  }) as Update<"invoices" | "invoices_products">;
const hasDeletedValue = (value: unknown) => Boolean(String(value || "").trim());

// ---------------------------------------------------------------------------
// Private helper: create a payment_account_movement and update client balance.
// Mirrors the logic previously handled by 00_payment_account.pb.js.
// ---------------------------------------------------------------------------
const createAccountMovement = async (
  clientId: string,
  typeName: PaymentAccountMovementTypeName,
  amount: number,
  description: string,
) => {
  const type = await typedPb
    .collection("payment_account_movement_types")
    .getFirstListItem(`name = "${escapePbFilterValue(typeName)}"`);

  const client = await typedPb.collection("clients").getOne(clientId);
  const currentBalance = Number(client.balance ?? 0);
  const nextBalance =
    typeName === "payment"
      ? currentBalance - Math.abs(amount)
      : typeName === "debt"
        ? currentBalance + Math.abs(amount)
        : amount; // adjustment

  const movement = await typedPb
    .collection("payment_account_movements")
    .create({
      client: clientId,
      type: type.id,
      amount,
      description: description.trim(),
    });

  await typedPb
    .collection("clients")
    .update(clientId, { balance: nextBalance });

  return movement;
};

const getOpenInvoiceState = () =>
  typedPb
    .collection("invoicestates")
    .getFirstListItem(`name = "open"`, pbNoAutoCancelOptions);

const isOpenInvoiceState = async (stateId: string | undefined) => {
  if (!stateId) return false;

  const openState = await getOpenInvoiceState();
  return stateId === openState.id;
};

const applyClientBalanceDelta = async (
  clientId: string,
  delta: number,
  description: string,
) => {
  if (!clientId) return;

  const roundedDelta = Number(delta.toFixed(2));
  if (roundedDelta === 0) return;

  await createAccountMovement(
    clientId,
    roundedDelta > 0 ? "debt" : "payment",
    Math.abs(roundedDelta),
    description,
  );
};

const syncInvoiceBalanceChange = async (
  invoiceId: string,
  previousClientId: string,
  nextClientId: string,
  previousTotal: number,
  nextTotal: number,
) => {
  if (previousClientId === nextClientId) {
    await applyClientBalanceDelta(
      nextClientId,
      nextTotal - previousTotal,
      `Ajuste factura ${invoiceId}`,
    );
    return;
  }

  await applyClientBalanceDelta(
    previousClientId,
    -previousTotal,
    `Cambio de cliente factura ${invoiceId}`,
  );
  await applyClientBalanceDelta(
    nextClientId,
    nextTotal,
    `Cambio de cliente factura ${invoiceId}`,
  );
};

const getActiveNameSortedFullList = async <T,>(
  collection: "measureunits" | "products",
) =>
  typedPb.collection(collection).getFullList({
    filter: `deleted = ""`,
    sort: "+name",
  }) as Promise<T[]>;

export const invoiceApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getInvoicesList: build.query<ListResult<InvoicesResponse>, GetList>({
      queryFn: async (_arg) => {
        const res = await typedPb.collection("invoices").getList(
          _arg.page,
          _arg.perPage,
          {
            filter: buildInvoicesListFilter(_arg.filter),
            sort: pbSort(_arg.order, _arg.orderBy),
          },
        );

        return { data: res };
      },
      providesTags: [invoiceTag],
    }),
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
    getInvoiceProductsByInvoiceId: build.query<InvoicesProductsResponse[], string>({
      queryFn: async (_arg) => {
        const res = await typedPb.collection("invoices_products").getFullList({
          filter: `invoice = "${escapePbFilterValue(_arg)}" && deleted = ""`,
          sort: "+created",
        });
        return { data: res };
      },
      providesTags: [invoiceProductsTag],
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
    getPaymentAccountMovementTypes: build.query<
      PaymentAccountMovementTypesResponse[],
      void
    >({
      queryFn: async () => {
        const res = await typedPb
          .collection("payment_account_movement_types")
          .getFullList({
            sort: "+name",
          });
        return { data: res };
      },
      providesTags: [paymentAccountMovementTypesTag],
    }),
    getPaymentAccountMovementsList: build.query<
      ListResult<PaymentAccountMovementWithExpand>,
      GetList
    >({
      queryFn: async (_arg) => {
        const res = await typedPb.collection("payment_account_movements").getList(
          _arg.page,
          _arg.perPage,
          {
            expand: "client,type",
            filter: buildPaymentAccountMovementsListFilter(_arg.filter),
            sort: pbSort(_arg.order, _arg.orderBy),
          },
        );
        return { data: res as ListResult<PaymentAccountMovementWithExpand> };
      },
      providesTags: [paymentAccountMovementsTag],
    }),
    createPaymentAccountMovement: build.mutation<
      CreatePaymentAccountMovementRes,
      CreatePaymentAccountMovementReq
    >({
      queryFn: async (_arg) => {
        const type = await typedPb
          .collection("payment_account_movement_types")
          .getFirstListItem(`name = "${escapePbFilterValue(_arg.typeName)}"`);

        const client = await typedPb
          .collection("clients")
          .getOne(_arg.clientId);

        const currentBalance = Number(client.balance ?? 0);
        const nextBalance =
          _arg.typeName === "payment"
            ? currentBalance - Math.abs(_arg.amount)
            : _arg.typeName === "debt"
              ? currentBalance + Math.abs(_arg.amount)
              : _arg.amount; // adjustment

        const movement = await typedPb
          .collection("payment_account_movements")
          .create({
            client: _arg.clientId,
            type: type.id,
            amount: _arg.amount,
            description: _arg.description?.trim() ?? "",
          });

        const updatedClient = await typedPb
          .collection("clients")
          .update(_arg.clientId, { balance: nextBalance });

        return { data: { movement, client: updatedClient } };
      },
      invalidatesTags: [paymentAccountMovementsTag, clientsTag],
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
        const res =
          await getActiveNameSortedFullList<ProductsResponse>("products");
        return { data: res };
      },
      providesTags: [productsTag],
    }),
    getMeasureUnits: build.query<MeasureunitsResponse[], void>({
      queryFn: async () => {
        const res =
          await getActiveNameSortedFullList<MeasureunitsResponse>("measureunits");
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
    getProductTypesList: build.query<ListResult<ProductTypesResponse>, GetList>({
      queryFn: async (_arg) => {
        const res = await typedPb.collection("product_types").getList(
          _arg.page,
          _arg.perPage,
          {
            filter: pbFilter(_arg.filter, ["name"]),
            sort: pbSort(_arg.order, _arg.orderBy),
          },
        );
        return { data: res };
      },
      providesTags: [productTypesTag],
    }),
    getProductTypeById: build.query<ProductTypesResponse, string>({
      queryFn: async (_arg) => {
        const res = await typedPb.collection("product_types").getOne(_arg);
        return { data: res };
      },
      providesTags: [productTypesTag],
    }),
    getConfig: build.query<ConfigsResponse, void>({
      queryFn: async () => {
        const res = await typedPb
          .collection("configs")
          .getFirstListItem(`company = "${configKey.COMPANY}"`);
        return { data: res };
      },
      providesTags: [configsTag],
    }),
    getLastProductPriceForClient: build.query<
      LastProductPriceForClient | null,
      GetLastProductPriceForClientReq
    >({
      queryFn: async (_arg) => {
        const clientId = escapePbFilterValue(_arg.clientId);
        const productId = escapePbFilterValue(_arg.productId);
        const openState = await getOpenInvoiceState();
        const excludeInvoiceId = _arg.excludeInvoiceId
          ? escapePbFilterValue(_arg.excludeInvoiceId)
          : "";
        const excludeFilter = excludeInvoiceId
          ? ` && id != "${excludeInvoiceId}"`
          : "";

        const invoices = await typedPb.collection("invoices").getFullList({
          filter: `client = "${clientId}" && state = "${escapePbFilterValue(openState.id)}" && deleted = ""${excludeFilter}`,
          sort: "-date,-created",
          fields: "id,date,created",
          requestKey: null,
        });

        for (const invoice of invoices) {
          const invoiceProducts = await typedPb
            .collection("invoices_products")
            .getFullList({
              filter: `invoice = "${escapePbFilterValue(invoice.id)}" && product = "${productId}" && deleted = ""`,
              sort: "-created",
              requestKey: null,
            });
          const lastItem = invoiceProducts[0];

          if (lastItem) {
            return {
              data: {
                unitPrice: Number(lastItem.unit_price ?? 0),
              },
            };
          }
        }

        return { data: null };
      },
      providesTags: [invoiceProductsTag],
    }),
    createInvoice: build.mutation<CreateInvoiceRes, CreateInvoiceReq>({
      queryFn: async (_arg) => {
        // 1. Resolve invoice state record by name
        const stateName = (_arg.state ?? "open").trim();
        const stateRecord = await typedPb
          .collection("invoicestates")
          .getFirstListItem(
            `name = "${escapePbFilterValue(stateName)}"`,
            pbNoAutoCancelOptions,
          );

        // 2. Compute totals
        const invoiceItems = _arg.items.map((item) => ({
          ...item,
          total: getItemTotal(item),
        }));
        const subtotal = invoiceItems.reduce((acc, item) => acc + item.total, 0);
        const discountPercent = normalizeDiscountPercent(_arg.discount);
        const invoiceTotal = Math.max(
          0,
          subtotal * (1 - discountPercent / 100),
        );

        // 3. Create invoice record
        const invoice = await typedPb.collection("invoices").create({
          client: _arg.client,
          date: _arg.date,
          discount: discountPercent,
          total: invoiceTotal,
          state: stateRecord.id,
        });

        // 4. Create invoice product records
        const invoiceProducts = await Promise.all(
          invoiceItems.map((item) =>
            typedPb.collection("invoices_products").create(
              {
                invoice: invoice.id,
                product: item.product,
                amount: item.amount,
                unit_price: item.unitPrice,
                discount: normalizeDiscountPercent(item.discount),
                total: item.total,
              },
              pbNoAutoCancelOptions,
            ),
          ),
        );

        // 5. Account movements (only for "open" invoices with a positive total)
        const paymentMovements: PaymentAccountMovementsResponse[] = [];
        const shouldUpdateAccount = String(stateRecord.name || "") === "open";

        if (shouldUpdateAccount && invoiceTotal > 0) {
          const debtMovement = await createAccountMovement(
            _arg.client,
            "debt",
            invoiceTotal,
            `Factura ${invoice.id}`,
          );
          paymentMovements.push(debtMovement);

          const paidAmount = _arg.paidNow
            ? invoiceTotal
            : Math.min(invoiceTotal, Math.max(0, _arg.paidAmount ?? 0));

          if (paidAmount > 0) {
            const paymentMovement = await createAccountMovement(
              _arg.client,
              "payment",
              paidAmount,
              `Pago factura ${invoice.id}`,
            );
            paymentMovements.push(paymentMovement);
          }
        }

        return { data: { invoice, invoiceProducts, paymentMovements } };
      },
      invalidatesTags: [
        invoiceTag,
        invoiceProductsTag,
        invoicesViewTag,
        paymentAccountMovementsTag,
        clientsTag,
      ],
    }),
    updateInvoice: build.mutation<InvoicesResponse, UpdateInvoiceReq>({
      queryFn: async (_arg, _api, _options) => {
        const currentInvoice = await typedPb.collection("invoices").getOne(_arg.id);
        const requestedState =
          typeof _arg.data.state === "string" ? _arg.data.state.trim() : "";
        const currentState =
          typeof currentInvoice.state === "string"
            ? currentInvoice.state.trim()
            : "";
        const fallbackState = requestedState || currentState
          ? null
          : await getOpenInvoiceState();
        const nextState = requestedState || currentState || fallbackState?.id;
        const currentInvoiceIsActive = !hasDeletedValue(currentInvoice.deleted);
        const previousStateIsOpen =
          currentInvoiceIsActive && (await isOpenInvoiceState(currentState));
        const nextStateIsOpen =
          currentInvoiceIsActive && (await isOpenInvoiceState(nextState));

        const invoiceDiscountPercent =
          _arg.data.discount === undefined
            ? normalizeDiscountPercent(Number(currentInvoice.discount ?? 0))
            : normalizeDiscountPercent(Number(_arg.data.discount));

        let subtotal = 0;

        if (_arg.items) {
          const existingItems = await typedPb
            .collection("invoices_products")
            .getFullList({
              filter: `invoice = "${escapePbFilterValue(_arg.id)}" && deleted = ""`,
            });

          const existingItemsById = new Map(
            existingItems.map((item) => [item.id, item]),
          );
          const nextItemIds = new Set(
            _arg.items
              .map((item) => item.id)
              .filter((id): id is string => Boolean(id)),
          );

          const nextItems = _arg.items.map((item) => ({
            ...item,
            total: getItemTotal(item),
          }));

          subtotal = nextItems.reduce((acc, item) => acc + item.total, 0);

          for (const item of nextItems) {
            const payload = {
              product: item.product,
              amount: item.amount,
              unit_price: item.unitPrice,
              discount: normalizeDiscountPercent(item.discount),
              total: item.total,
            };

            if (item.id && existingItemsById.has(item.id)) {
              await typedPb
                .collection("invoices_products")
                .update(item.id, payload);
              continue;
            }

            await typedPb.collection("invoices_products").create({
              invoice: _arg.id,
              ...payload,
            });
          }

          await Promise.all(
            existingItems
              .filter((item) => !nextItemIds.has(item.id))
              .map((item) =>
                typedPb.collection("invoices_products").delete(item.id),
              ),
          );
        } else {
          const existingItems = await typedPb
            .collection("invoices_products")
            .getFullList({
              filter: `invoice = "${escapePbFilterValue(_arg.id)}" && deleted = ""`,
            });

          subtotal = existingItems.reduce(
            (acc, item) => acc + Number(item.total ?? 0),
            0,
          );
        }

        const total = Math.max(0, subtotal * (1 - invoiceDiscountPercent / 100));

        const res = await typedPb.collection("invoices").update(_arg.id, {
          ..._arg.data,
          state: nextState,
          discount: invoiceDiscountPercent,
          total,
        });

        if (previousStateIsOpen && nextStateIsOpen) {
          await syncInvoiceBalanceChange(
            _arg.id,
            String(currentInvoice.client || ""),
            String(res.client || ""),
            Number(currentInvoice.total ?? 0),
            Number(res.total ?? 0),
          );
        } else if (previousStateIsOpen && !nextStateIsOpen) {
          await applyClientBalanceDelta(
            String(currentInvoice.client || ""),
            -Number(currentInvoice.total ?? 0),
            `Cambio de estado factura ${_arg.id}`,
          );
        } else if (!previousStateIsOpen && nextStateIsOpen) {
          await applyClientBalanceDelta(
            String(res.client || ""),
            Number(res.total ?? 0),
            `Cambio de estado factura ${_arg.id}`,
          );
        }

        return { data: res };
      },
      invalidatesTags: [
        invoiceTag,
        invoiceProductsTag,
        invoicesViewTag,
        paymentAccountMovementsTag,
        clientsTag,
      ],
    }),
    deleteInvoice: build.mutation<void, string>({
      queryFn: async (_arg) => {
        const deletedAt = new Date().toISOString();
        const invoiceSoftDeletePayload = buildInvoiceSoftDeletePayload(deletedAt);
        const currentInvoice = await typedPb.collection("invoices").getOne(_arg);
        const shouldSyncAccount =
          !hasDeletedValue(currentInvoice.deleted) &&
          (await isOpenInvoiceState(String(currentInvoice.state || "")));
        const existingItems = await typedPb
          .collection("invoices_products")
          .getFullList({
            filter: `invoice = "${escapePbFilterValue(_arg)}" && deleted = ""`,
          });

        await Promise.all(
          existingItems.map((item) =>
            typedPb
              .collection("invoices_products")
              .update(item.id, invoiceSoftDeletePayload),
          ),
        );
        await typedPb.collection("invoices").update(
          _arg,
          invoiceSoftDeletePayload,
        );

        if (shouldSyncAccount) {
          await applyClientBalanceDelta(
            String(currentInvoice.client || ""),
            -Number(currentInvoice.total ?? 0),
            `Anulacion factura ${_arg}`,
          );
        }

        return { data: undefined };
      },
      invalidatesTags: [
        invoiceTag,
        invoiceProductsTag,
        invoicesViewTag,
        paymentAccountMovementsTag,
        clientsTag,
      ],
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
    deleteClient: build.mutation<void, string>({
      queryFn: async (_arg) => {
        await typedPb.collection("clients").update(_arg, softDeletePayload);
        return { data: undefined };
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
    deleteProduct: build.mutation<void, string>({
      queryFn: async (_arg) => {
        await typedPb.collection("products").update(_arg, softDeletePayload);
        return { data: undefined };
      },
      invalidatesTags: [productsTag],
    }),
    updateProductType: build.mutation<ProductTypesResponse, UpdateProductTypeReq>({
      queryFn: async (_arg) => {
        const res = await typedPb
          .collection("product_types")
          .update(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [productTypesTag],
    }),
    updateConfig: build.mutation<ConfigsResponse, UpdateConfigReq>({
      queryFn: async (_arg) => {
        const res = await typedPb.collection("configs").update(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [configsTag],
    }),
    createProductType: build.mutation<ProductTypesResponse, CreateProductTypeReq>({
      queryFn: async (_arg) => {
        const res = await typedPb.collection("product_types").create(_arg.data);
        return { data: res };
      },
      invalidatesTags: [productTypesTag],
    }),
    deleteProductType: build.mutation<void, string>({
      queryFn: async (_arg) => {
        await typedPb.collection("product_types").update(_arg, softDeletePayload);
        return { data: undefined };
      },
      invalidatesTags: [productTypesTag],
    }),
  }),
});

export const {
  useCreateClientMutation,
  useCreateInvoiceMutation,
  useCreatePaymentAccountMovementMutation,
  useCreateProductMutation,
  useCreateProductTypeMutation,
  useDeleteClientMutation,
  useDeleteInvoiceMutation,
  useDeleteProductMutation,
  useDeleteProductTypeMutation,
  useGetClientByIdQuery,
  useGetClientsQuery,
  useGetClientsListQuery,
  useGetInvoicesListQuery,
  useGetInvoiceViewByIdQuery,
  useLazyGetInvoiceProductsByInvoiceIdQuery,
  useLazyGetLastProductPriceForClientQuery,
  useGetInvoicesByDateRangeQuery,
  useGetInvoiceStatesQuery,
  useGetInvoicesViewQuery,
  useGetMeasureUnitsQuery,
  useGetPaymentAccountMovementsListQuery,
  useGetPaymentAccountMovementTypesQuery,
  useGetProductByIdQuery,
  useGetConfigQuery,
  useGetProductTypeByIdQuery,
  useGetProductTypesListQuery,
  useGetProductsQuery,
  useGetProductsListQuery,
  useUpdateClientMutation,
  useUpdateInvoiceMutation,
  useUpdateConfigMutation,
  useUpdateProductMutation,
  useUpdateProductTypeMutation,
} = invoiceApi;
