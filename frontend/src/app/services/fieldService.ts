import { Field, UpdateFieldReq, UpdateItemReq } from "src/interfaces";
import { ApiTag, mainApi, pbFilter, pbSort } from "./api";
import { pb } from "src/libs";
import { ListResult } from "pocketbase";
import { GetList } from "src/types";

const tag = ApiTag.Fields;
const expand = "location";

export const fieldApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getFields: build.query<ListResult<Field>, GetList>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(tag)
          .getList<Field>(_arg.page, _arg.perPage, {
            expand,
            sort: pbSort(_arg.order, _arg.orderBy),
            filter: pbFilter(_arg.filter, ["name", "location.name"]),
          });
        return { data: res };
      },
      providesTags: [tag],
    }),
    getField: build.query<Field, string>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).getOne<Field>(_arg);
        return { data: res };
      },
      providesTags: [tag],
    }),
    updateField: build.mutation<Field, UpdateItemReq<UpdateFieldReq>>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).update<Field>(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
  }),
});
