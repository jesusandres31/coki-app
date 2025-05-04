import {
  Product,
  CreateProductReq,
  UpdateItemReq,
  ProductStore,
} from "src/interfaces";
import { ApiTag, FLAG, mainApi, pbFilter, pbSort } from "./api";
import { pb } from "src/libs";
import { ListResult } from "pocketbase";
import { GetList } from "src/types";
import { storeApi } from "./storeService";
import { store } from "../store";

const tag = ApiTag.Products;
const expand = "measure_unit";

export const productApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<ListResult<Product>, GetList>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(tag)
          .getList<Product>(_arg.page, _arg.perPage, {
            expand,
            sort: pbSort(_arg.order, _arg.orderBy),
            filter: pbFilter(_arg.filter, ["name", "measure_unit.name"]),
          });
        return { data: res };
      },
      providesTags: [tag],
    }),
    getProduct: build.query<Product, string>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).getOne<Product>(_arg);
        return { data: res };
      },
      providesTags: [tag],
    }),
    createProduct: build.mutation<Product, CreateProductReq>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).create<Product>(_arg);
        // create also instances of product in stores
        const stores = storeApi.endpoints.getStores.select()(
          store.getState()
        ).data;
        if (stores) {
          stores.forEach(async (store) => {
            pb.collection(ApiTag.ProductsStores).create<ProductStore>({
              product: res.id,
              store: store.id,
              stock: 0,
            });
          });
        }
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    updateProduct: build.mutation<Product, UpdateItemReq<CreateProductReq>>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(tag)
          .update<Product>(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    deleteProduct: build.mutation<PromiseSettledResult<void>[], string[]>({
      queryFn: async (_arg, _api, _options) => {
        const items = Array.isArray(_arg) ? _arg : [_arg];
        const res = await Promise.allSettled(
          items.map(async (id) => {
            await pb.collection(tag).update<Product>(id, FLAG.delete);
          })
        );
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
  }),
});
