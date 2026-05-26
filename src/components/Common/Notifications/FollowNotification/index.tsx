import type { Notification } from "@/app/types/notification";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import ProfileAvatar from "../../ProfileAvatar";
import { Link } from "react-router";
import useRelativeTime from "@/hooks/useRelativeTime";
import clsx from "clsx";

type FollowNotificationProps = {
  notification: Notification;
};
const FollowNotification: FC<FollowNotificationProps> = ({ notification }) => {
  const { t } = useTranslation("notification");

  const time = useRelativeTime(notification.createdAt, "long");

  return (
    <>
      <Link
        to={`/${notification.actor?.username}`}
        className={clsx(
          "flex gap-3 hover:bg-black/8 animated p-2",
          !notification.isRead && "bg-amber-600/8 hover:bg-amber-600/12!",
        )}
      >
        <ProfileAvatar
          src={notification.actor?.avatar}
          className="size-12 rounded-full"
        />
        <div className="flex flex-col gap-1 leading-4 w-full mt-1">
          {notification.actor ? (
            <>
              <b>
                {notification.actor.firstName} {notification.actor.lastName}
              </b>
              <div className="w-full block leading-5 align-bottom">
                {t("follow.known", {
                  firstName: notification.actor.firstName,
                  lastName: notification.actor.lastName,
                })}
                <span className="text-muted-foreground float-right text-xs align-bottom inline-block pt-1 ml-2">
                  {time}
                </span>
              </div>
            </>
          ) : (
            t("follow.unknown")
          )}
        </div>
      </Link>
    </>
  );
};

export default FollowNotification;
