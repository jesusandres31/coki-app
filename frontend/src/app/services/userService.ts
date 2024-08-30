import { User, UpdateItemReq, UpsertUserReq } from "src/interfaces";
import { ApiTag, mainApi } from "./api";
import { pb } from "src/libs";

const tag = ApiTag.Users;

export const userApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    updateUser: build.mutation<User, UpdateItemReq<UpsertUserReq>>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).update<User>(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
  }),
});
