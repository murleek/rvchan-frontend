import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import useWebSocket from "./useWebSocket";
import type { AppDispatch, RootState } from "@/app/store";
// import { useGetNotificationsInfiniteQuery } from "@/app/features/notification/notifications.api";
import { markAllSeenOptimistic } from "@/app/features/notification/notifications.slice";
import { notificationsApi } from "@/app/features/notification/notifications.api";

const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { emit } = useWebSocket();

  // const { data, isLoading, isFetching, isError, refetch } =
  //   useGetNotificationsInfiniteQuery();

  const unseen = useSelector((s: RootState) => s.notifications.counters.unseen);
  const connected = useSelector((s: RootState) => s.notifications.connected);
  const items = useSelector((s: RootState) => s.notifications.items);

  const markAllSeen = useCallback(() => {
    dispatch(markAllSeenOptimistic());

    dispatch(
      notificationsApi.util.updateQueryData(
        "getNotifications",
        undefined,
        (draft) => {
          draft.pages.forEach((page) => {
            page.notifications.data.forEach((n) => (n.isRead = true));
          });
        },
      ),
    );
    emit("notification:seen");
  }, [dispatch, emit]);

  // const notifications = useMemo(
  //   () => data?.pages.map((page) => page.notifications.data).flat() ?? [],
  //   [data],
  // );

  return {
    // notifications,
    unseen,
    connected,
    // isLoading,
    // isFetching,
    // isError,
    markAllSeen,
    // refetch,
    items,
  };
};

export default useNotifications;
