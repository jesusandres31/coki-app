import {
  CreateProductStoreReq,
  ProductStore,
  UpdateItemReq,
} from "src/interfaces";
import { ApiTag, getCurrent, mainApi, pbFilter, pbSort, FLAG } from "./api";
import { pb } from "src/libs";
import { ListResult } from "pocketbase";
import { GetList } from "src/types";

const tag = ApiTag.ProductsStores;
const expand = "product";

export const productStoreApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getProductsStores: build.query<ListResult<ProductStore>, GetList>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(tag)
          .getList<ProductStore>(_arg.page, _arg.perPage, {
            expand,
            sort: pbSort(_arg.order, _arg.orderBy),
            filter:
              pbFilter(_arg.filter, ["product.name"]) + getCurrent.Store(),
          });
        return { data: res };
      },
      providesTags: [tag, FLAG.refetch],
    }),
    getProductStore: build.query<ProductStore, string>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).getOne<ProductStore>(_arg);
        return { data: res };
      },
      providesTags: [tag],
    }),
    createProductStore: build.mutation<ProductStore, CreateProductStoreReq>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).create<ProductStore>(_arg);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    updateProductStore: build.mutation<
      ProductStore,
      UpdateItemReq<CreateProductStoreReq>
    >({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(tag)
          .update<ProductStore>(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    deleteProductStore: build.mutation<PromiseSettledResult<void>[], string[]>({
      queryFn: async (_arg, _api, _options) => {
        const items = Array.isArray(_arg) ? _arg : [_arg];
        const res = await Promise.allSettled(
          items.map(async (id) => {
            await pb.collection(tag).update<ProductStore>(id, FLAG.delete);
          })
        );
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
  }),
});
