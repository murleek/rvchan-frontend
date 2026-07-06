import ProfileAvatar from "../ProfileAvatar";
import { type FC, type HTMLAttributes } from "react";
import type { PublicPost, TextEntity } from "@/app/types/post";
import useRelativeTime from "@/hooks/useRelativeTime";
import { MessageCircle } from "lucide-react";
import clsx from "clsx";
import Loader from "../Loader";
import { Link, useNavigate } from "react-router";
import { PAGES } from "@/constants";
import LikeButton from "../Post/components/LikeButton";

type PostReplyProps = {
  thread: PublicPost;
  className?: string;
  cardClassName?: string;
  noLink?: boolean;
  noActions?: boolean;
};

function renderTextWithEntities(content: string, entities?: TextEntity[]) {
  if (!entities || entities.length === 0) {
    return content;
  }

  const result = [];
  let lastIndex = 0;

  entities
    .sort((a, b) => a.from - b.from)
    .forEach((e, i) => {
      // обычный текст до mention
      if (lastIndex < e.from) {
        result.push(
          <span key={`text-${i}`}>{content.slice(lastIndex, e.from)}</span>,
        );
      }

      // mention
      const mentionText = content.slice(e.from, e.to);

      switch (e.type) {
        case "mention":
          result.push(
            <Link
              key={`mention-${i}`}
              to={`/${e.username}`}
              className="text-blue-500 hover:underline"
            >
              {mentionText}
            </Link>,
          );
          break;
        case "link":
          result.push(
            <a
              key={`link-${i}`}
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline break-all"
            >
              {mentionText}
            </a>,
          );
          break;
      }
      lastIndex = e.to;
    });

  // хвост строки
  if (lastIndex < content.length) {
    result.push(<span key="tail">{content.slice(lastIndex)}</span>);
  }

  return result;
}

const PostReply: FC<PostReplyProps & HTMLAttributes<HTMLDivElement>> = ({
  thread,
  className,
  cardClassName,
  noLink,
  noActions,
  ...props
}) => {
  const time = useRelativeTime(thread.createdAt || new Date().toString());
  const navigate = useNavigate();

  const Component = thread.createdAt && !noLink ? Link : "div";
  const compProps:
    | { to: string; className?: string }
    | { to: never; className?: string } =
    thread.createdAt && !noLink
      ? {
          to: PAGES.POST.replaceAll(
            ":username",
            thread.user.username,
          ).replaceAll(":id", String(thread.id)),
          className,
        }
      : ({ className } as { to: never; className?: string });

  const reply = () => {
    if (!thread.createdAt) return;
    navigate(
      PAGES.POST.replaceAll(":username", thread.user.username).replaceAll(
        ":id",
        String(thread.id),
      ) + "#reply",
    );
  };

  return (
    <Component {...compProps}>
      <div
        className={clsx(
          `p-1 not-first:border-t animated flex items-start relative gap-2 rounded-lg m-1`,
          !thread.createdAt
            ? "opacity-50 animate-pulse"
            : !noLink && "hover:bg-black/8 cursor-pointer",
          cardClassName,
        )}
        {...props}
      >
        <div className="flex justify-end w-13">
          <div
            onClick={() =>
              navigate(PAGES.USER.replaceAll(":username", thread.user.username))
            }
            className={`rounded-full p-1 hover:bg-black/8 animated`}
          >
            <ProfileAvatar
              className="size-6 rounded-full"
              src={thread.user.avatar}
              alt={`${thread.user.firstName}'s (@${thread.user.username}) avatar`}
            />
          </div>
        </div>
        <div className="flex flex-col flex-1 p-2 pl-0">
          <div
            className={clsx(
              "flex gap-2 w-full ",
              !thread.createdAt && "justify-between",
            )}
          >
            <span className="text-sm/4 font-extrabold">
              {thread.user.firstName} {thread.user.lastName}
            </span>
            <span className="text-sm/4 text-muted-foreground flex items-center gap-1.5">
              {thread.createdAt ? time : <Loader className="size-4!" />}
            </span>
          </div>
          <div className="text-[15px] mt-0.75 leading-5.5 whitespace-pre-wrap">
            {renderTextWithEntities(thread.content, thread.entities)}
          </div>
          {!noActions && (
            <div className="flex mt-0.5 text-sm text-muted-foreground relative -left-3">
              <LikeButton thread={thread} />
              <button
                className="flex gap-1 items-center hover:cursor-pointer hover:bg-black/8 animated px-3 py-2 rounded-xl group/button color-muted-foreground hover:color-blue-500!"
                onClick={(e) => {
                  e.preventDefault();
                  reply();
                }}
              >
                <MessageCircle className="size-4.5 animated fill-transparent group-hover/button:fill-current group-active/button:scale-80" />
                <span className="text-xs font-bold tabular-nums">
                  {thread.replyCount}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Component>
  );
};

export default PostReply;
