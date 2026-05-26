import { Link } from "react-router";
import FollowAcceptedNotification from "./FollowAcceptedNotification";
import FollowNotification from "./FollowNotification";
import MentionNotification from "./MentionNotification";
import NewDeviceNotification from "./NewDeviceNotification";
import ReplyNotification from "./ReplyNotification";
import ReplyToOtherNotification from "./ReplyToOtherNotification";
import type { FC } from "react";
import type { Notification } from "@/app/types/notification";

type NotificationProps = {
  notification: Notification;
};

const NotificationItem: FC<NotificationProps> = ({ notification }) => {
  switch (notification.type) {
    case "follow":
      return <FollowNotification notification={notification} />;
    case "follow_accepted":
      return <FollowAcceptedNotification notification={notification} />;
    case "new_device":
      return <NewDeviceNotification notification={notification} />;
    case "post_mention":
      return <MentionNotification notification={notification} />;
    case "post_reply":
      return <ReplyNotification notification={notification} />;
    case "post_reply_to_other":
      return <ReplyToOtherNotification notification={notification} />;
    default:
      return (
        <Link
          to={notification.actor ? `/${notification.actor.username}` : "#"}
          className="flex gap-3 hover:bg-black/8 animated p-2"
        >
          {notification.type} ×{notification.count} by{" "}
          {notification.actor ? (
            <Link to={`/${notification.actor.username}`}>
              {notification.actor.firstName} {notification.actor.lastName}
            </Link>
          ) : (
            "Unknown User"
          )}
        </Link>
      );
  }
};

export default NotificationItem;
