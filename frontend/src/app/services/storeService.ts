import { Store } from "src/interfaces";
import { ApiTag, mainApi } from "./api";
import { pb } from "src/libs";

const tag = ApiTag.Stores;

export const storeApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getStores: build.query<Store[], void>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).getFullList<Store>();
        return { data: res };
      },
      providesTags: [tag],
    }),
  }),
});
