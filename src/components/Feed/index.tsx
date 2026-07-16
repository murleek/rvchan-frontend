import { useGetFeedInfiniteQuery } from "@/app/features/posts/posts.api";
import { Card } from "../ui/card";
import InfiniteScroll from "../Common/InfiniteScroll";
import Post from "../Common/Post";
import { useTranslation } from "react-i18next";
import Loader from "../Common/Loader";
import PostForm from "../Common/PostForm";
import useAuth from "@/hooks/useAuth";
import type { PostFormModalDetails } from "../Common/PostFormModal";
import useModal from "@/hooks/common/useModal";

const Feed = () => {
  const { t } = useTranslation("home");
  const { profile } = useAuth();
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetching } =
    useGetFeedInfiniteQuery();

  const threads = data?.pages.flatMap((page) => page.data) ?? [];

  const { openModal } = useModal<PostFormModalDetails>("post");

  const handleNextPage = async () => {
    await fetchNextPage();
  };

  if (isLoading) {
    return (
      <Card className="md:px-4 h-40 gap-4 justify-center items-center">
        <Loader className="text-fuchsia-500 size-10!" />
        <span className="text-center text-muted-foreground animated transition-colors block">
          {t("loading")}
        </span>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="md:px-4 gap-2 h-40 justify-center items-center">
        <div className="text-sm text-destructive px-4 py-6 text-center flex flex-col justify-center items-center">
          {t("error")} {String(error)}
        </div>
      </Card>
    );
  }

  if (threads.length === 0) {
    return (
      <Card className="w-full mb-4 p-0 gap-4 h-40 px-4 py-6 text-muted-foreground justify-center items-center">
        <span className="text-4xl font-serif">{t("shrug")}</span>
        <span className="text-sm">{t("noPosts")}</span>
      </Card>
    );
  }

  if (!profile) return null;

  return (
    <Card className="w-full mb-4 p-0 gap-4">
      <div className="m-2 mb-0 group/postform max-md:hidden">
        <PostForm
          className="relative bg-background! mb-2 **:pointer-events-none cursor-pointer"
          username={profile.username}
          onClick={(e) => {
            e.stopPropagation();
            openModal();
          }}
        />
        <div className="group-last-of-type/postform:hidden px-2">
          <div className="h-px w-full bg-border box-border rounded-full" />
        </div>
      </div>
      <InfiniteScroll
        isFetching={isFetching}
        loadMore={handleNextPage}
        hasMore={!!hasNextPage}
        className="flex flex-col gap-0"
      >
        {threads.map((thread, i) => (
          <Post key={i} thread={thread} notEntriable={!thread.createdAt} />
        ))}
      </InfiniteScroll>
    </Card>
  );
};

export default Feed;
