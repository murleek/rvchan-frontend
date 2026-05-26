import type { ShortPublicUser } from "./user";

export const NotificationType = {
  FOLLOW: "follow",
  FOLLOW_ACCEPTED: "follow_accepted",
  NEW_DEVICE: "new_device",
  POST_MENTION: "post_mention",
  POST_REPLY: "post_reply",
  POST_REPLY_TO_OTHER: "post_reply_to_other",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export interface ParsedUserAgent {
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  deviceType: string | null;
  deviceVendor: string | null;
  deviceModel: string | null;
  raw: string;
}

export type Notification = {
  id: string;
  createdAt: string;
  isRead: boolean;
  type: NotificationType;
  count: number;
  groupKey: string | null;
  recipient: ShortPublicUser;
  actor?: ShortPublicUser;
  payload?: Record<string, unknown>;
};
