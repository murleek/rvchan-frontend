import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../baseQuery";
import { postsApi } from "../posts/posts.api";
import type { RootState } from "@/app/store";

const toggleLike = (item: { isLiked: boolean; likeCount: number }): void => {
  item.isLiked = !item.isLiked;
  item.likeCount += item.isLiked ? 1 : -1;
};

function* extractItems(
  page: unknown,
): Generator<{ id: string; isLiked: boolean; likeCount: number }> {
  const p = page as {
    data?: { id: string; isLiked: boolean; likeCount: number }[];
    id?: string;
    isLiked?: boolean;
    likeCount?: number;
    replies?: { data: { id: string; isLiked: boolean; likeCount: number }[] };
    parents?: { id: string; isLiked: boolean; likeCount: number }[];
  };

  if (p.data) {
    yield* p.data;
  } else {
    yield p as { id: string; isLiked: boolean; likeCount: number };
    yield* p.replies?.data ?? [];
    yield* p.parents ?? [];
  }
}

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
        const entries = postsApi.util.selectInvalidatedBy(store, ["posts"]);

        const undos: (() => void)[] = [];

        for (const entry of entries) {
          if (!entry) continue;

          const { originalArgs, endpointName } = entry;
          const isValidEndpoint =
            endpointName === "getPost" ||
            endpointName === "getUserThreads" ||
            endpointName === "getFeed";
          if (!isValidEndpoint) continue;

          const { undo } = dispatch(
            postsApi.util.updateQueryData(
              endpointName,
              originalArgs,
              (draft) => {
                for (const page of draft.pages) {
                  for (const item of extractItems(page)) {
                    if (item.id === postId) toggleLike(item);
                  }
                }
              },
            ),
          );
          undos.push(undo);
        }

        queryFulfilled.catch(() => undos.forEach((undo) => undo()));
      },
    }),
  }),
});

export const { useReactPostMutation } = reactionApi;
