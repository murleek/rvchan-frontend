// ---------------------------------------------------------------------------
// Обработчики сложных socket-событий
// ---------------------------------------------------------------------------

import { postsApi } from "../features/posts/posts.api";
import type { AppDispatch } from "../store";
import type { PublicPost } from "../types/post";

// ---------------------------------------------------------------------------
// post:created
// ---------------------------------------------------------------------------

export interface PostCreatedData {
  post: PublicPost & { parent: { username: string; id: string } };
  jobId: string;
}

export function handlePostCreated(
  dispatch: AppDispatch,
  data: PostCreatedData,
): void {
  const jobId = `job:${data.jobId}`;

  const updatePages = (pages: { data: PublicPost[] }[]) => {
    const pageIndex = pages.findIndex((page) =>
      page.data.some((post) => post.id === jobId),
    );

    if (pageIndex === -1) {
      pages[0]?.data.unshift(data.post);
      return;
    }

    const postIndex = pages[pageIndex].data.findIndex(
      (post) => post.id === jobId,
    );

    if (postIndex !== -1) {
      pages[pageIndex].data[postIndex] = data.post;
    } else {
      pages[pageIndex].data.unshift(data.post);
    }
  };

  if (data.post.parent) {
    dispatch(
      postsApi.util.updateQueryData(
        "getPost",
        {
          username: data.post.parent.username,
          threadId: String(data.post.parent.id),
        },
        (draft) => {
          try {
            draft.pages?.forEach((page) => {
              page.replyCount += 1;
              page.parents?.forEach((parent) => {
                parent.replyCount += 1;
              });

              const replyIndex = page.replies.data.findIndex(
                (reply) => reply.id === jobId,
              );

              if (replyIndex !== -1) {
                page.replies.data[replyIndex] = data.post;
              }
            });
          } catch (error) {
            console.error("Error updating getPost cache:", error);
          }
        },
      ),
    );
  } else {
    dispatch(
      postsApi.util.updateQueryData(
        "getUserThreads",
        { username: data.post.user.username },
        (draft) => {
          const pages = draft?.pages;
          if (!pages) return;
          updatePages(pages);
        },
      ),
    );
    dispatch(postsApi.util.invalidateTags(["feed"]));
  }
}
