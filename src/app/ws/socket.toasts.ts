// ---------------------------------------------------------------------------
// Построение toast-уведомлений из событий socket
// ---------------------------------------------------------------------------

import {
  NotificationType,
  type Notification,
  type ParsedUserAgent,
} from "../types/notification";
import { type Toast, type ToastIcon } from "../features/toasts/toasts.slice";
import i18n from "@/utils/i18n";

async function ensureNotificationNamespace(): Promise<void> {
  if (!i18n.hasLoadedNamespace("notification")) {
    await i18n.loadNamespaces("notification");
  }
}

function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, { ns: "notification", ...options });
}

function buildActorToast(
  notification: Notification,
  titleKey: string,
  descriptionKey: string,
): Omit<Toast, "id"> {
  const { actor } = notification;
  return {
    type: "info",
    title: actor
      ? t(titleKey, {
          firstName: actor.firstName,
          lastName: actor.lastName,
        })
      : t(titleKey.replace("_known", ".unknown")),
    description: actor ? t(descriptionKey) : undefined,
    icon: {
      type: "image",
      cdn: actor?.avatar ?? "",
    } satisfies ToastIcon,
  };
}

export async function buildToast(
  notification: Notification,
): Promise<Omit<Toast, "id">> {
  await ensureNotificationNamespace();

  switch (notification.type) {
    case NotificationType.FOLLOW:
      return buildActorToast(
        notification,
        "follow.title_known",
        "follow.known",
      );

    case NotificationType.FOLLOW_ACCEPTED:
      return buildActorToast(
        notification,
        "follow_accepted.title_known",
        "follow_accepted.known",
      );

    case NotificationType.NEW_DEVICE: {
      const { device, ip } = notification.payload as {
        device: ParsedUserAgent;
        ip: string;
      };

      const vendorModel = [device.deviceVendor, device.deviceModel]
        .filter(Boolean)
        .join(" ");

      const isDesktop = device.deviceType === "desktop";

      return {
        type: "info",
        title: t(isDesktop ? "device.new_pc" : "device.new_device", {
          vendorModel: vendorModel || t("device.unknown_device"),
          os: device.os || t("device.unknown_os"),
          osVersion: device.osVersion ?? "",
        }),
        description: t("device.description", {
          browser: device.browser || t("device.unknown_browser"),
          browserVersion: device.browserVersion ?? "",
          ip: ip || t("device.unknown_ip"),
        }),
        icon: {
          type: "icon",
          name: "smartphone",
          className: "text-blue-700",
        } satisfies ToastIcon,
      };
    }

    case NotificationType.POST_MENTION:
      return buildActorToast(
        notification,
        "post_mention.title_known",
        "post_mention.known",
      );

    case NotificationType.POST_REPLY:
      return buildActorToast(
        notification,
        "post_reply.title_known",
        "post_reply.known",
      );

    case NotificationType.POST_REPLY_TO_OTHER:
      return buildActorToast(
        notification,
        "post_reply_to_other.title_known",
        "post_reply_to_other.known",
      );

    default:
      return { type: "info", title: t("notification.new") };
  }
}
