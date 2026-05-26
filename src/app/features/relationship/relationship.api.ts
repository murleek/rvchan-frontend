import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../baseQuery";
import type { ShortProfile } from "@/app/types/auth";
import type { CursorPaginated } from "@/app/types/pagination";

export const relationshipApi = createApi({
  reducerPath: "relationshipApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Relationship"],
  endpoints: (builder) => ({
    follow: builder.mutation<void, number>({
      query: (data) => ({
        url: "/relationship/follow",
        method: "POST",
        body: { id: data },
      }),
      invalidatesTags: ["Relationship"],
    }),
    unfollow: builder.mutation<void, number>({
      query: (data) => ({
        url: "/relationship/unfollow",
        method: "POST",
        body: { id: data },
      }),
      invalidatesTags: ["Relationship"],
    }),

    getFriends: builder.query<ShortProfile[], number>({
      query: (id) => "/relationship/friends/" + id,
      providesTags: ["Relationship"],
    }),
    getFollowers: builder.infiniteQuery<
      CursorPaginated<ShortProfile>,
      string,
      { before?: string; after?: string }
    >({
      providesTags: ["Relationship"],
      infiniteQueryOptions: {
        initialPageParam: { before: undefined, after: undefined },
        getPreviousPageParam: (firstPage) => {
          if (!firstPage.meta.hasPrevPage) {
            return undefined;
          }
          return {
            before: firstPage.meta.prevCursor,
          };
        },
        getNextPageParam: (lastPage) => {
          if (!lastPage.meta.hasNextPage) {
            return undefined;
          }
          return {
            after: lastPage.meta.nextCursor,
          };
        },
      },
      query: ({ queryArg, pageParam }) => {
        const params = new URLSearchParams();
        if (pageParam) {
          if (pageParam.before) {
            params.append("before", pageParam.before);
          }
          if (pageParam.after) {
            params.append("after", pageParam.after);
          }
        }
        return "/relationship/followers/" + queryArg;
      },
    }),
    getFollowing: builder.infiniteQuery<
      CursorPaginated<ShortProfile>,
      string,
      { before?: string; after?: string }
    >({
      providesTags: ["Relationship"],
      infiniteQueryOptions: {
        initialPageParam: { before: undefined, after: undefined },
        getPreviousPageParam: (firstPage) => {
          if (!firstPage.meta.hasPrevPage) {
            return undefined;
          }
          return {
            before: firstPage.meta.prevCursor,
          };
        },
        getNextPageParam: (lastPage) => {
          if (!lastPage.meta.hasNextPage) {
            return undefined;
          }
          return {
            after: lastPage.meta.nextCursor,
          };
        },
      },
      query: ({ queryArg, pageParam }) => {
        const params = new URLSearchParams();
        if (pageParam) {
          if (pageParam.before) {
            params.append("before", pageParam.before);
          }
          if (pageParam.after) {
            params.append("after", pageParam.after);
          }
        }
        return "/relationship/following/" + queryArg;
      },
    }),
  }),
});

export const {
  useFollowMutation,
  useUnfollowMutation,
  useGetFollowersInfiniteQuery,
  useGetFollowingInfiniteQuery,
  useGetFriendsQuery,
} = relationshipApi;
