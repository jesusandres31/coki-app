import { Ball, CreateBallReq, UpdateItemReq } from "src/interfaces";
import { ApiTag, FLAG, mainApi, pbFilter, pbSort } from "./api";
import { pb } from "src/libs";
import { ListResult } from "pocketbase";
import { GetList } from "src/types";

const tag = ApiTag.Balls;
const expand = "field";

export const ballApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getBalls: build.query<ListResult<Ball>, GetList>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(tag)
          .getList<Ball>(_arg.page, _arg.perPage, {
            expand,
            sort: pbSort(_arg.order, _arg.orderBy),
            filter: pbFilter(_arg.filter, ["name", "detail", "field.name"]),
          });
        return { data: res };
      },
      providesTags: [tag],
    }),
    getBall: build.query<Ball, string>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).getOne<Ball>(_arg, { expand });
        return { data: res };
      },
      providesTags: [tag],
    }),
    createBall: build.mutation<Ball, CreateBallReq>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).create<Ball>(_arg);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    updateBall: build.mutation<Ball, UpdateItemReq<CreateBallReq>>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).update<Ball>(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    deleteBall: build.mutation<PromiseSettledResult<void>[], string[]>({
      queryFn: async (_arg, _api, _options) => {
        const items = Array.isArray(_arg) ? _arg : [_arg];
        const res = await Promise.allSettled(
          items.map(async (id) => {
            await pb.collection(tag).update<Ball>(id, FLAG.delete);
          })
        );
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
  }),
});
