import { useGetPostInfiniteQuery } from "@/app/features/posts/posts.api";
import InfiniteScroll from "@/components/Common/InfiniteScroll";
import Loader from "@/components/Common/Loader";
import Post from "@/components/Common/Post";
import PostForm from "@/components/Common/PostForm";
import type { PostFormModalDetails } from "@/components/Common/PostFormModal";
import PostReply from "@/components/Common/PostReply";
import { Card } from "@/components/ui/card";
import { useHeader } from "@/hooks/common/useHeader";
import useModal from "@/hooks/common/useModal";
import profile from "@/pages/settings/profile";
import { useEffect, useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router";

const PostPage: FC = () => {
  const { setPayload, openModal } = useModal<PostFormModalDetails>("post");
  const { username, id } = useParams();
  const { hash } = useLocation();
  const { t } = useTranslation("posts");
  useHeader(t("header", { id }));

  const {
    data: post,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
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

  useEffect(() => {
    if (!post?.pages[0]) return;
    setPayload({ reply: post?.pages[0] ?? null, isReplyingToThread: true });
    return () => {
      setPayload(null);
    };
  }, [post]);

  useEffect(() => {
    if (hash === "#reply") {
      openModal();
    }
  }, [hash]);

  if (!username || !id) {
    return (
      <div className="text-sm text-destructive h-40 px-4 py-6 text-center flex flex-col justify-center items-center">
        {t("error")} {t("invalidUrl")}
      </div>
    );
  }

  return (
    <div className="w-full flex gap-4 flex-col h-full justify-between">
      <div>
        <Card className="w-full p-0 gap-0 group/posts">
          {isLoading ? (
            <div className="md:px-4 gap-2 h-40 w-full flex flex-col justify-center items-center">
              <Loader className="text-fuchsia-500 size-10!" />
              <span className="text-center text-muted-foreground animated transition-colors block">
                {t("loading")}
              </span>
            </div>
          ) : error ? (
            "originalStatus" in error && error.originalStatus === 404 ? (
              <div className="text-sm text-destructive h-40 px-4 py-6 text-center flex flex-col justify-center items-center">
                {t("error.notFound")}
              </div>
            ) : (
              <div className="text-sm text-destructive h-40 px-4 py-6 text-center flex flex-col justify-center items-center">
                {t("error")} {String(error)}
              </div>
            )
          ) : post?.pages[0] ? (
            <>
              {(post?.pages[0]?.parents?.length || 0) > 0 && (
                <div>
                  {post?.pages[0]?.parents
                    ?.map((p) => (
                      <PostReply key={p.id} thread={p} parent noUnderline />
                    ))
                    .reverse()}
                </div>
              )}
              <Post thread={post.pages[0]} notEntriable forceUnderline />
              <div className="m-2 mb-0 group/postform max-md:hidden">
                {!isLoading && (
                  <PostForm
                    username={username}
                    parentId={id}
                    disabled={!!error}
                    className="mb-2"
                  />
                )}
                <div className="group-last-of-type/postform:hidden">
                  <div className="h-px w-full bg-border box-border rounded-full" />
                </div>
              </div>
              {replies.length > 0 && (
                <InfiniteScroll
                  isFetching={isFetching}
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
          {!isLoading && !error && replies.length === 0 && (
            <div className="text-sm text-muted-foreground px-4 py-8 text-center flex flex-col justify-center gap-3 items-center">
              <span className="text-4xl font-serif">{t("shrug")}</span>
              <span className="text-sm">{t("noPosts")}</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PostPage;
