import { SignUpResponse, SignInRequest } from "src/interfaces";
import { ApiTag, mainApi } from "./api";
import { pb } from "src/libs";
import { RecordAuthResponse } from "pocketbase";

const tag = ApiTag.Users;
const expand = "store";

export const authApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    signIn: build.mutation<RecordAuthResponse<SignUpResponse>, SignInRequest>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(tag)
          .authWithPassword<SignUpResponse>(_arg.email, _arg.password, {
            expand,
          });
        return { data: res };
      },
    }),
  }),
});
