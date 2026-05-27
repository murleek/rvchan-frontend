import { useGetPostInfiniteQuery } from "@/app/features/posts/posts.api";
import InfiniteScroll from "@/components/Common/InfiniteScroll";
import Loader from "@/components/Common/Loader";
import Post from "@/components/Common/Post";
import PostForm from "@/components/Common/PostForm";
import PostReply from "@/components/Common/PostReply";
import { Card } from "@/components/ui/card";
import { useHeader } from "@/hooks/common/useHeader";
import { useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

const PostPage: FC = () => {
  const { username, id } = useParams();
  const { t } = useTranslation("posts");
  useHeader(t("header", { id }));

  const {
    data: post,
    isLoading: isUserThreadsLoading,
    error: userThreadsError,
    fetchNextPage,
    hasNextPage,
    isFetching: isFetchingThreads,
  } = useGetPostInfiniteQuery(
    { username: username!, threadId: id! },
    { skip: !username || !id },
  );

  const handleNextPage = async () => {
    await fetchNextPage();
  };
  const replies = useMemo(() => {
    return post?.pages.map((page) => page.replies.data).flat() ?? [];
  }, [post]);

  if (!username || !id) {
    return (
      <div className="text-sm text-destructive h-40 px-4 py-6 text-center flex flex-col justify-center items-center">
        {t("error")} {t("invalidUrl")}
      </div>
    );
  }

  return (
    <div className="w-full flex gap-4 flex-col h-full">
      {(post?.pages[0]?.parents?.length || 0) > 0 &&
        post?.pages[0]?.parents
          ?.map((p) => (
            <Card key={p.id} className="p-0 gap-0 relative zoom-75">
              <PostReply key={p.id} thread={p} />
              <div className="absolute left-1/2 -translate-x-1/2 bg-border top-[calc(100%+1px)] h-4 w-0.5" />
            </Card>
          ))
          .reverse()}
      <div>
        <Card className="w-full p-0 gap-0">
          {isUserThreadsLoading ? (
            <div className="md:px-4 gap-2 h-40 w-full flex flex-col justify-center items-center">
              <Loader className="text-fuchsia-500 size-10!" />
              <span className="text-center text-muted-foreground animated transition-colors block">
                {t("loading")}
              </span>
            </div>
          ) : userThreadsError ? (
            "originalStatus" in userThreadsError &&
            userThreadsError.originalStatus === 404 ? (
              <div className="text-sm text-destructive h-40 px-4 py-6 text-center flex flex-col justify-center items-center">
                {t("error.notFound")}
              </div>
            ) : (
              <div className="text-sm text-destructive h-40 px-4 py-6 text-center flex flex-col justify-center items-center">
                {t("error")} {String(userThreadsError)}
              </div>
            )
          ) : post?.pages[0] ? (
            <>
              <Post thread={post.pages[0]} notEntriable />
              {replies.length > 0 && (
                <InfiniteScroll
                  isFetching={isFetchingThreads}
                  loadMore={handleNextPage}
                  hasMore={!!hasNextPage}
                  className="flex flex-col gap-0"
                >
                  {replies.map((reply) => (
                    <PostReply key={reply.id} thread={reply} />
                  ))}
                </InfiniteScroll>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground h-40 px-4 py-6 text-center flex flex-col justify-center items-center">
              {t("empty.other")}
            </p>
          )}
        </Card>
      </div>
      {!isUserThreadsLoading && !userThreadsError && replies.length === 0 && (
        <p className="text-sm text-muted-foreground h-4 px-4 text-center flex flex-col justify-center items-center">
          {t("empty.replies")}
        </p>
      )}
      {!isUserThreadsLoading && (
        <PostForm
          username={username}
          parentId={id}
          disabled={!!userThreadsError}
          className="sticky bottom-20 md:bottom-5 shadow-lg"
        />
      )}
    </div>
  );
};

export default PostPage;
