import { Card } from "@/components/ui/card";
import InfiniteScroll from "../InfiniteScroll";
import Post from "../Post";
import { useMemo, type FC } from "react";
import type { User } from "@/app/types/auth";
import { useGetUserThreadsInfiniteQuery } from "@/app/features/posts/posts.api";
import Loader from "../Loader";
import { useTranslation } from "react-i18next";

type UserThreadProps = {
  profile: User;
};

const UserThread: FC<UserThreadProps> = ({ profile }) => {
  const {
    data: userThreads,
    isLoading: isUserThreadsLoading,
    error: userThreadsError,
    fetchNextPage,
    hasNextPage,
    isFetching: isFetchingThreads,
  } = useGetUserThreadsInfiniteQuery(
    { username: profile?.username },
    { skip: !profile },
  );
  const { t } = useTranslation("posts");

  const handleNextPage = async () => {
    await fetchNextPage();
  };
  const threads = useMemo(() => {
    return userThreads?.pages.map((page) => page.data).flat() ?? [];
  }, [userThreads]);

  return (
    <Card className="w-full mb-4 p-0 gap-4">
      {isUserThreadsLoading ? (
        <div className="md:px-4 gap-2 h-40 w-full flex flex-col justify-center items-center">
          <Loader className="text-fuchsia-500 size-10!" />
          <span className="text-center text-muted-foreground animated transition-colors block">
            {t("loading")}
          </span>
        </div>
      ) : userThreadsError ? (
        <div className="text-sm text-destructive h-40 px-4 py-6 text-center flex flex-col justify-center items-center">
          {t("error")} {String(userThreadsError)}
        </div>
      ) : threads.length > 0 ? (
        <InfiniteScroll
          isFetching={isFetchingThreads}
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
      ) : (
        <p className="text-sm text-muted-foreground h-40 px-4 py-6 text-center flex flex-col justify-center items-center">
          {t(profile.isMine ? "empty.mine" : "empty.other")}
        </p>
      )}
    </Card>
  );
};

export default UserThread;
