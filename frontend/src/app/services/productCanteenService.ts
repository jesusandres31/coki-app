import {
  CreateProductCanteenReq,
  ProductCanteen,
  UpdateItemReq,
} from "src/interfaces";
import { ApiTag, getCurrent, mainApi, pbFilter, pbSort, FLAG } from "./api";
import { pb } from "src/libs";
import { ListResult } from "pocketbase";
import { GetList } from "src/types";

const tag = ApiTag.ProductsCanteens;
const expand = "product";

export const productCanteenApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getProductsCanteens: build.query<ListResult<ProductCanteen>, GetList>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(tag)
          .getList<ProductCanteen>(_arg.page, _arg.perPage, {
            expand,
            sort: pbSort(_arg.order, _arg.orderBy),
            filter:
              pbFilter(_arg.filter, ["product.name"]) + getCurrent.Canteen(),
          });
        return { data: res };
      },
      providesTags: [tag, FLAG.refetch],
    }),
    getProductCanteen: build.query<ProductCanteen, string>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).getOne<ProductCanteen>(_arg);
        return { data: res };
      },
      providesTags: [tag],
    }),
    createProductCanteen: build.mutation<
      ProductCanteen,
      CreateProductCanteenReq
    >({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).create<ProductCanteen>(_arg);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    updateProductCanteen: build.mutation<
      ProductCanteen,
      UpdateItemReq<CreateProductCanteenReq>
    >({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(tag)
          .update<ProductCanteen>(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    deleteProductCanteen: build.mutation<
      PromiseSettledResult<void>[],
      string[]
    >({
      queryFn: async (_arg, _api, _options) => {
        const items = Array.isArray(_arg) ? _arg : [_arg];
        const res = await Promise.allSettled(
          items.map(async (id) => {
            await pb.collection(tag).update<ProductCanteen>(id, FLAG.delete);
          })
        );
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
  }),
});
