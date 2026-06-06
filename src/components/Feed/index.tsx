import { useGetFeedInfiniteQuery } from "@/app/features/posts/posts.api";
import { Card } from "../ui/card";
import InfiniteScroll from "../Common/InfiniteScroll";
import Post from "../Common/Post";
import { useTranslation } from "react-i18next";
import Loader from "../Common/Loader";

const Feed = () => {
  const { t } = useTranslation("home");
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetching } =
    useGetFeedInfiniteQuery();

  const threads = data?.pages.flatMap((page) => page.data) ?? [];

  const handleNextPage = async () => {
    await fetchNextPage();
  };

  if (isLoading) {
    return (
      <Card className="md:px-4 gap-2 h-40 justify-center items-center">
        <Loader className="text-fuchsia-500 size-10!" />
        <span className="text-center text-muted-foreground animated transition-colors block">
          {t("loading")}
        </span>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive h-40 px-4 py-6 text-center flex flex-col justify-center items-center">
        {t("error")} {String(error)}
      </div>
    );
  }

  return (
    <Card className="w-full mb-4 p-0 gap-4">
      <InfiniteScroll
        isFetching={isFetching}
        loadMore={handleNextPage}
        hasMore={!!hasNextPage}
        className="flex flex-col gap-0"
      >
        {threads.map((thread) => (
          <Post
            key={thread.id}
            thread={thread}
            notEntriable={!thread.createdAt}
          />
        ))}
      </InfiniteScroll>
    </Card>
  );
};

export default Feed;
