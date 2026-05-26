import { createApi } from "@reduxjs/toolkit/query/react";
import type { Notification } from "@/app/types/notification";
import { baseQueryWithReauth } from "@/app/baseQuery";
import type { CursorPaginated } from "@/app/types/pagination";

type NotificationQueryArg = { before?: string; after?: string };

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    // getNotifications: builder.query<
    //   { notifications: CursorPaginated<Notification>; unseen: number },
    //   void
    // >({
    //   query: () => "/notification",
    //   providesTags: ["Notifications"],
    // }),
    getNotifications: builder.infiniteQuery<
      { notifications: CursorPaginated<Notification>; unseen: number },
      void,
      NotificationQueryArg
    >({
      providesTags: ["Notifications"],
      infiniteQueryOptions: {
        initialPageParam: { before: undefined, after: undefined },
        getPreviousPageParam: (firstPage) => {
          if (!firstPage.notifications.meta.hasPrevPage) {
            return undefined;
          }
          return {
            before: firstPage.notifications.meta.prevCursor,
          };
        },
        getNextPageParam: (lastPage) => {
          if (!lastPage.notifications.meta.hasNextPage) {
            return undefined;
          }
          return {
            after: lastPage.notifications.meta.nextCursor,
          };
        },
      },
      // The `query` function receives `{queryArg, pageParam}` as its argument
      // query({ queryArg, pageParam }) {
      //   return `/type/${queryArg}?page=${pageParam}`;
      // },
      query: ({ pageParam }: { pageParam: NotificationQueryArg }) => {
        const params = new URLSearchParams();
        if (pageParam) {
          if (pageParam.before) {
            params.append("before", pageParam.before);
          }
          if (pageParam.after) {
            params.append("after", pageParam.after);
          }
        }
        return `/notification?${params.toString()}`;
      },
    }),
  }),
});

export const { useGetNotificationsInfiniteQuery } = notificationsApi;
