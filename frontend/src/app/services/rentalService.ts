import {
  CreateRentalReq,
  Rental,
  RentalView,
  UpdateItemReq,
} from "src/interfaces";
import {
  ApiTag,
  ApiView,
  FLAG,
  getCurrent,
  mainApi,
  pbFilter,
  pbSort,
} from "./api";
import { pb } from "src/libs";
import { ListResult } from "pocketbase";
import { GetList } from "src/types";

const tag = ApiTag.Rentals;
const view = ApiView.Rentals;

export const rentalApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getRentals: build.query<ListResult<RentalView>, GetList>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb
          .collection(view)
          .getList<RentalView>(_arg.page, _arg.perPage, {
            sort: pbSort(_arg.order, _arg.orderBy),
            filter:
              pbFilter(_arg.filter, [
                "client.name",
                "field.name",
                "ball.name",
              ]) + getCurrent.Location(),
          });
        return { data: res };
      },
      providesTags: [tag, FLAG.refetch],
    }),
    getRental: build.query<RentalView, string>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(view).getOne<RentalView>(_arg);
        return { data: res };
      },
      providesTags: [tag],
    }),
    createRental: build.mutation<Rental, CreateRentalReq>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).create<Rental>(_arg);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    updateRental: build.mutation<Rental, UpdateItemReq<CreateRentalReq>>({
      queryFn: async (_arg, _api, _options) => {
        const res = await pb.collection(tag).update<Rental>(_arg.id, _arg.data);
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
    deleteRental: build.mutation<PromiseSettledResult<void>[], string[]>({
      queryFn: async (_arg, _api, _options) => {
        const items = Array.isArray(_arg) ? _arg : [_arg];
        const res = await Promise.allSettled(
          items.map(async (id) => {
            await pb.collection(tag).update<Rental>(id, FLAG.delete);
          })
        );
        return { data: res };
      },
      invalidatesTags: [tag],
    }),
  }),
});
