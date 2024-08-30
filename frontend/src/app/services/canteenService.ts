import { Canteen } from "src/interfaces";
import { ApiTag, mainApi } from "./api";
import { pb } from "src/libs";

const tag = ApiTag.Canteens;

export const canteenApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getCanteens: build.query<Canteen[], void>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).getFullList<Canteen>();
        return { data: res };
      },
      providesTags: [tag],
    }),
  }),
});
