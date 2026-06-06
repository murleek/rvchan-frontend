import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../baseQuery";
import type { CursorPaginated } from "@/app/types/pagination";
import type { PublicPost } from "@/app/types/post";

type CursorQueryArg = { before?: string; after?: string };

export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["posts", "feed"],
  endpoints: (builder) => ({
    post: builder.mutation<
      {
        jobId: string;
        status: "queued";
      },
      { content: string; parentId?: string }
    >({
      query: (data) => ({
        url: "/posts",
        method: "POST",
        body: data,

        providesTags: ["posts"],
      }),
    }),
    getPost: builder.infiniteQuery<
      PublicPost & {
        replies: CursorPaginated<PublicPost>;
      },
      {
        username: string;
        threadId: string;
      },
      CursorQueryArg
    >({
      infiniteQueryOptions: {
        initialPageParam: { before: undefined, after: undefined },
        getPreviousPageParam: (firstPage) => {
          if (!firstPage.replies.meta.hasPrevPage) {
            return undefined;
          }
          return {
            before: firstPage.replies.meta.prevCursor,
          };
        },
        getNextPageParam: (lastPage) => {
          if (!lastPage.replies.meta.hasNextPage) {
            return undefined;
          }
          return {
            after: lastPage.replies.meta.nextCursor,
          };
        },
      },
      query: ({ pageParam, queryArg }) => {
        const params = new URLSearchParams();
        if (pageParam) {
          if (pageParam.before) {
            params.append("before", pageParam.before);
          }
          if (pageParam.after) {
            params.append("after", pageParam.after);
          }
        }
        return `/posts/${queryArg.username}/threads/${queryArg.threadId}?${params.toString()}`;
      },
      providesTags: ["posts"],
    }),
    cancel: builder.mutation<{ id: string; hash: string }, string>({
      query: (jobId) => ({
        url: `/posts/cancel/${jobId}`,
        method: "DELETE",
      }),
    }),
    getUserThreads: builder.infiniteQuery<
      CursorPaginated<PublicPost>,
      { username: string },
      CursorQueryArg
    >({
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
      query: ({ pageParam, queryArg }) => {
        const params = new URLSearchParams();
        if (pageParam) {
          if (pageParam.before) {
            params.append("before", pageParam.before);
          }
          if (pageParam.after) {
            params.append("after", pageParam.after);
          }
        }
        return `/posts/${queryArg.username}/threads?${params.toString()}`;
      },
      providesTags: ["posts"],
    }),
    getFeed: builder.infiniteQuery<
      CursorPaginated<PublicPost>,
      void,
      CursorQueryArg
    >({
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
      query: ({ pageParam }) => {
        const params = new URLSearchParams();
        if (pageParam) {
          if (pageParam.before) {
            params.append("before", pageParam.before);
          }
          if (pageParam.after) {
            params.append("after", pageParam.after);
          }
        }
        return `/posts/feed?${params.toString()}`;
      },
      providesTags: ["posts", "feed"],
    }),
  }),
});

export const {
  usePostMutation,
  useGetUserThreadsInfiniteQuery,
  useGetFeedInfiniteQuery,
  useGetPostInfiniteQuery,
} = postsApi;
