import type { Profile } from "./auth";

export type PublicPost = {
  id: string;
  user: Profile;
  parentId: string | null;
  content: string;
  replyCount: number;
  likeCount: number;
  createdAt: Date | null;
  parents?: PublicPost[];
  entities?: TextEntity[];
  isLiked: boolean;
  reply?: PublicPost;
};

interface EntityBase {
  type: string;
  from: number;
  to: number;
}

export interface MentionEntity extends EntityBase {
  type: "mention";
  username: string;
}

export interface LinkEntity extends EntityBase {
  type: "link";
  url: string;
}

export type TextEntity = MentionEntity | LinkEntity;
