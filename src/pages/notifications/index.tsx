import { useGetNotificationsInfiniteQuery } from "@/app/features/notification/notifications.api";
import Loader from "@/components/Common/Loader";
import { useHeader } from "@/hooks/common/useHeader";
import { Card } from "@/components/ui/card";
// import useNotifications from "@/hooks/common/useNotifications";
import clsx from "clsx";
import { Fragment, useEffect, useMemo, type FC } from "react";
import BigHeader from "@/components/Header/components/BigHeader";
import InfiniteScroll from "@/components/Common/InfiniteScroll";
import { useTranslation } from "react-i18next";
import { getRelativeTimeString, Unit } from "@/hooks/useRelativeTime";
import useNotifications from "@/hooks/common/useNotifications";
import NotificationItem from "@/components/Common/Notifications";
import type { Notification } from "@/app/types/notification";

const groupByDate = <T = unknown,>(
  items: T[],
  dateCallback: (item: T) => Date,
): T[][] => {
  if (!items.length) {
    return [];
  }

  const sorted = [...items].sort(
    (a, b) => dateCallback(a).getTime() + dateCallback(b).getTime(),
  );

  const groups: T[][] = [];
  let currentGroup: T[] = [sorted[0]];

  const getDateKey = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const current = sorted[i];

    const prevDate = getDateKey(dateCallback(prev));
    const currentDate = getDateKey(dateCallback(current));

    if (prevDate !== currentDate) {
      groups.push(currentGroup);
      currentGroup = [current];
    } else {
      currentGroup.push(current);
    }
  }

  groups.push(currentGroup);

  return groups;
};

const Notifications: FC = () => {
  const { t: tCommon } = useTranslation();
  const { t } = useTranslation("notification");
  useHeader(t("header"), { hideTitle: true });

  const { data, isLoading, fetchNextPage, hasNextPage, isFetching } =
    useGetNotificationsInfiniteQuery();
  const { markAllSeen } = useNotifications();

  const handleNextPage = async () => {
    await fetchNextPage();
  };

  const notifications = useMemo(() => {
    return data?.pages.map((page) => page.notifications.data).flat() ?? [];
  }, [data]);

  useEffect(() => {
    return () => {
      // if (unseen && unseen > 0) {
      markAllSeen();
      // }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading)
    return (
      <div>
        <BigHeader>{t("header")}</BigHeader>
        <Card className="md:px-4 gap-2 h-40 justify-center items-center">
          <Loader className="text-fuchsia-500 size-10!" />
          <span className="text-center text-muted-foreground animated transition-colors block">
            {t("loading")}
          </span>
        </Card>
      </div>
    );

  if (!notifications || notifications.length === 0)
    return (
      <div>
        <BigHeader>{t("header")}</BigHeader>
        <Card className="md:px-4 gap-2 h-40 justify-center items-center">
          <span className="text-center text-muted-foreground animated transition-colors block">
            {t("empty")}
          </span>
        </Card>
      </div>
    );

  return (
    <div>
      <BigHeader>{t("header")}</BigHeader>
      <div className="flex flex-col gap-2">
        <InfiniteScroll
          isFetching={isFetching}
          loadMore={handleNextPage}
          hasMore={!!hasNextPage}
        >
          {groupByDate<Notification>(
            notifications,
            (n) => new Date(n.createdAt),
          ).map((group) => (
            <Fragment key={new Date(group[0].createdAt).toLocaleDateString()}>
              <h2 className="not-first:mt-4 font-bold text-xl first-letter:capitalize">
                {(() => {
                  const date = new Date(group[0].createdAt);
                  date.setHours(0, 0, 0, 0);
                  const time = getRelativeTimeString(date, [
                    Unit.DAY,
                    Unit.WEEK,
                    Unit.MONTH,
                    Unit.YEAR,
                  ]);
                  return tCommon(`units.relative.long.${time.t}`, time.params);
                })()}
              </h2>
              <Card className={clsx("relative p-0 gap-0 overflow-hidden")}>
                {group.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </Card>
            </Fragment>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Notifications;
