import { Client, CreateClientReq, UpdateItemReq } from "src/interfaces";
import { ApiTag, FLAG, mainApi, pbFilter, pbSort } from "./api";
import { pb } from "src/libs";
import { ListResult } from "pocketbase";
import { GetList } from "src/types";

const tag = ApiTag.Clients;

export const clientApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getClients: build.query<ListResult<Client>, GetList>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(tag)
          .getList<Client>(_arg.page, _arg.perPage, {
            sort: pbSort(_arg.order, _arg.orderBy),
            filter: pbFilter(_arg.filter, ["name", "phone"]),
          });
        return { data: res };
      },
      providesTags: [tag],
    }),
    getClient: build.query<Client, string>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).getOne<Client>(_arg);
        return { data: res };
      },
      providesTags: [tag],
    }),
    createClient: build.mutation<Client, CreateClientReq>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).create<Client>(_arg);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    updateClient: build.mutation<Client, UpdateItemReq<CreateClientReq>>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).update<Client>(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    deleteClient: build.mutation<PromiseSettledResult<void>[], string[]>({
      queryFn: async (_arg, _api, _options) => {
        const items = Array.isArray(_arg) ? _arg : [_arg];
        const res = await Promise.allSettled(
          items.map(async (id) => {
            await pb.collection(tag).update<Client>(id, FLAG.delete);
          })
        );
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
  }),
});
