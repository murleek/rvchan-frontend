import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../baseQuery";
import { postsApi } from "../posts/posts.api";
import type { RootState } from "@/app/store";

export const reactionApi = createApi({
  reducerPath: "reactionApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    reactPost: builder.mutation<
      { postId: string; action: "created" | "updated" | "deleted" },
      { postId: string }
    >({
      query: ({ postId }) => ({
        url: `/reaction/${postId}`,
        method: "POST",
      }),
      async onQueryStarted({ postId }, { dispatch, getState, queryFulfilled }) {
        const store = getState() as RootState;
        const allPosts = postsApi.util.selectInvalidatedBy(store, ["posts"]);

        const results: object[] = [];

        allPosts.forEach((entry) => {
          if (!entry) return;
          const { originalArgs, endpointName } = entry;
          if (endpointName === "getPost") {
            results.push(
              dispatch(
                postsApi.util.updateQueryData(
                  "getPost",
                  originalArgs,
                  (draft) => {
                    draft.pages.forEach((page) => {
                      if (page.id === postId) {
                        page.isLiked = !page.isLiked;
                        page.likeCount += page.isLiked ? 1 : -1;
                      }
                      page.replies.data.forEach((reply) => {
                        if (reply.id === postId) {
                          reply.isLiked = !reply.isLiked;
                          reply.likeCount += reply.isLiked ? 1 : -1;
                        }
                      });
                      page.parents?.forEach((parent) => {
                        if (parent.id === postId) {
                          parent.isLiked = !parent.isLiked;
                          parent.likeCount += parent.isLiked ? 1 : -1;
                        }
                      });
                    });
                  },
                ),
              ),
            );
          } else if (endpointName === "getUserThreads") {
            results.push(
              dispatch(
                postsApi.util.updateQueryData(
                  "getUserThreads",
                  originalArgs,
                  (draft) => {
                    draft.pages.forEach((page) => {
                      page.data.forEach((thread) => {
                        if (thread.id === postId) {
                          thread.isLiked = !thread.isLiked;
                          thread.likeCount += thread.isLiked ? 1 : -1;
                        }
                      });
                    });
                  },
                ),
              ),
            );
          }
        });

        queryFulfilled.catch(() => {
          results.forEach(
            (result) =>
              "undo" in result &&
              typeof result.undo === "function" &&
              result.undo(),
          );
        });
      },
    }),
  }),
});

export const { useReactPostMutation } = reactionApi;
