import { useGetFollowersInfiniteQuery } from "@/app/features/relationship/relationship.api";
import InfiniteScroll from "@/components/Common/InfiniteScroll";
import Loader from "@/components/Common/Loader";
import ProfileAvatar from "@/components/Common/ProfileAvatar";
import BigHeader from "@/components/Header/components/BigHeader";
import { Card } from "@/components/ui/card";
import { PAGES } from "@/constants";
import { useHeader } from "@/hooks/common/useHeader";
import useAuth from "@/hooks/useAuth";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";

const FollowersPage = () => {
  const { t } = useTranslation("profile");
  useHeader(t("followers_list.header"), {
    hideTitle: true,
  });
  const { profile } = useAuth();
  const { username } = useParams();
  const { data, fetchNextPage, hasNextPage, isLoading } =
    useGetFollowersInfiniteQuery(username!, {
      // skip: !username,
    });

  const followers = useMemo(() => {
    return data?.pages.flatMap((page) => page.data).flat() ?? [];
  }, [data]);

  if (isLoading)
    return (
      <div>
        <BigHeader>{t("followers_list.header")}</BigHeader>
        <Card className="md:px-4 gap-2 h-40 justify-center items-center">
          <Loader className="text-fuchsia-500 size-10!" />
          <span className="text-center text-muted-foreground animated transition-colors block">
            {t("followers_list.loading")}
          </span>
        </Card>
      </div>
    );

  if (!followers || followers.length === 0)
    return (
      <div>
        <BigHeader>{t("followers_list.header")}</BigHeader>
        <Card className="md:px-4 gap-2 h-40 justify-center items-center">
          <span className="text-center text-muted-foreground animated transition-colors block">
            {t(
              `followers_list.empty.${profile?.username === username ? "mine" : "other"}`,
            )}
          </span>
        </Card>
      </div>
    );

  return (
    <div>
      <BigHeader>{t("followers_list.header")}</BigHeader>

      <InfiniteScroll
        loadMore={async () => {
          await fetchNextPage();
        }}
        hasMore={hasNextPage}
        className="flex flex-col gap-2"
      >
        {followers.map((item) => (
          <Link
            key={item.id}
            to={PAGES.USER.replace(":username", item.username)}
          >
            <Card className="flex-row gap-4 p-3 hover:bg-black/8 dark:hover:bg-white/8 cursor-pointer">
              <ProfileAvatar src={item.avatar} />

              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">
                  {item.firstName} {item.lastName}
                </span>

                <span className="text-xs text-muted-foreground truncate">
                  @{item.username}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default FollowersPage;
