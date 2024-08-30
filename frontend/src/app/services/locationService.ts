import { Location } from "src/interfaces";
import { ApiTag, mainApi } from "./api";
import { pb } from "src/libs";

const tag = ApiTag.Locations;
const expand = "canteen";

export const locationApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getLocations: build.query<Location[], void>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).getFullList<Location>({ expand });
        return { data: res };
      },
      providesTags: [tag],
    }),
  }),
});
