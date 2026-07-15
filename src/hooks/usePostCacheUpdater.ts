import { useAppDispatch } from "@/app/hooks";
import useAuth from "./useAuth";
import type { PublicPost } from "@/app/types/post";
import { postsApi } from "@/app/features/posts/posts.api";

export function usePostCacheUpdater(username: string) {
  const { profile } = useAuth();
  const dispatch = useAppDispatch();

  const makeTempId = () => `temp-id-${Date.now()}`;
  const makeQueueId = (queueId: string) => `job:${queueId}`;

  const buildPost = (
    content: string,
    parentId: string | null,
    id: string,
  ): PublicPost => ({
    id,
    user: profile!,
    content: content.trim(),
    parentId,
    replyCount: 0,
    likeCount: 0,
    createdAt: null,
    isLiked: false,
  });

  const getDataList = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    draft: any,
    parentId?: string,
  ): PublicPost[] | undefined => {
    if (parentId) return draft?.pages?.[0]?.replies?.data;
    return draft?.pages?.[0]?.data;
  };

  const addPostToCache = (content: string, parentId?: string) => {
    if (!profile) return;

    const tempId = makeTempId();
    const post = buildPost(content, parentId ?? null, tempId);

    if (parentId) {
      dispatch(
        postsApi.util.updateQueryData(
          "getPost",
          { username, threadId: parentId },
          (draft) => {
            getDataList(draft, parentId)?.unshift(post);
          },
        ),
      );
    } else {
      dispatch(
        postsApi.util.updateQueryData(
          "getUserThreads",
          { username },
          (draft) => {
            getDataList(draft)?.unshift(post);
          },
        ),
      );
      dispatch(
        postsApi.util.updateQueryData("getFeed", undefined, (draft) => {
          getDataList(draft)?.unshift(post);
        }),
      );
    }

    return tempId;
  };

  const replaceTempIdWithQueueId = (
    content: string,
    tempId: string,
    queueId: string,
    parentId?: string,
  ) => {
    if (!profile) return;

    const queueIdStr = makeQueueId(queueId);

    const update = (draft: unknown) => {
      const data = getDataList(draft, parentId);
      if (!data) return;

      const index = data.findIndex((obj) => obj.id === tempId);
      if (index !== -1) {
        data[index].id = queueIdStr;
      } else {
        data.unshift(buildPost(content, parentId ?? null, queueIdStr));
      }
    };

    if (parentId) {
      dispatch(
        postsApi.util.updateQueryData(
          "getPost",
          { username, threadId: parentId },
          update,
        ),
      );
    } else {
      dispatch(
        postsApi.util.updateQueryData("getUserThreads", { username }, update),
      );
      dispatch(postsApi.util.updateQueryData("getFeed", undefined, update));
    }
  };

  return { addPostToCache, replaceTempIdWithQueueId };
}
