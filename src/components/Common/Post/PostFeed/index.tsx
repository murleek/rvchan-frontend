import ProfileAvatar from "../../ProfileAvatar";
import { type FC, type HTMLAttributes } from "react";
import type { PublicPost, TextEntity } from "@/app/types/post";
import useRelativeTime from "@/hooks/useRelativeTime";
import { MessageCircle } from "lucide-react";
import clsx from "clsx";
import Loader from "../../Loader";
import { Link, useNavigate } from "react-router";
import { PAGES } from "@/constants";
import LikeButton from "../components/LikeButton";
import PostReply from "../PostReply";

type PostReplyProps = {
  thread: PublicPost;
  className?: string;
  cardClassName?: string;
  notEntriable?: boolean;
  noActions?: boolean;
  parent?: boolean;
  noUnderline?: boolean;
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

const PostFeed: FC<PostReplyProps & HTMLAttributes<HTMLDivElement>> = ({
  thread,
  className,
  cardClassName,
  notEntriable,
  noActions,
  parent,
  noUnderline,
  ...props
}) => {
  className = clsx("group/postfeed relative", className);

  const time = useRelativeTime(thread.createdAt || new Date().toString());
  const navigate = useNavigate();

  const Component = thread.createdAt && !notEntriable ? Link : "div";
  const compProps:
    | { to: string; className?: string }
    | { to: never; className?: string } =
    thread.createdAt && !notEntriable
      ? {
          to: PAGES.POST.replaceAll(
            ":username",
            thread.user.username,
          ).replaceAll(":id", String(thread.id)),
          className: clsx("touch-action-none", className),
        }
      : ({ className } as {
          to: never;
          className?: string;
        });

  // const reply = () => {
  //   if (!thread.createdAt) return;
  //   navigate(
  //     PAGES.POST.replaceAll(":username", thread.user.username).replaceAll(
  //       ":id",
  //       String(thread.id),
  //     ) + "#reply",
  //   );
  // };

  return (
    <Component
      {...compProps}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <div
        className={clsx(
          `p-1 not-first:border-t animated transition-[scale,padding,margin,bottom,box-shadow,background] flex items-start gap-1.5 rounded-lg relative m-1 z-1 ring-1 ring-transparent focus:outline-0`,
          !thread.createdAt
            ? "opacity-50 animate-pulse"
            : !notEntriable &&
                "active:scale-[106%] active:bg-card active:py-2 active:my-0 active:ring-border cursor-pointer",
          cardClassName,
        )}
        {...props}
      >
        <div className="flex justify-end w-12.25">
          <div
            onClick={() =>
              !notEntriable &&
              navigate(PAGES.USER.replaceAll(":username", thread.user.username))
            }
            className={clsx(
              "rounded-full p-1",
              !notEntriable && "hover:bg-black/8 cursor-pointer animated",
            )}
          >
            <ProfileAvatar
              className="size-10 rounded-full"
              src={thread.user.avatar}
              alt={`${thread.user.firstName}'s (@${thread.user.username}) avatar`}
            />
          </div>
        </div>
        <div className="flex flex-col flex-1 p-1 pl-0">
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
            <div className="flex mt-0.5 text-sm text-muted-foreground relative -left-3 gap-1">
              <LikeButton thread={thread} />
              <button
                className="flex gap-1 items-center hover:cursor-pointer hover:bg-black/8 animated px-3 py-2 rounded-xl group/button color-muted-foreground hover:color-blue-500!"
                // onClick={(e) => {
                //   e.preventDefault();
                //   reply();
                // }}
              >
                <MessageCircle className="size-4.5 animated fill-transparent group-hover/button:fill-current group-active/button:scale-80" />
                <span className="text-xs font-bold tabular-nums">
                  {thread.replyCount}
                </span>
              </button>
            </div>
          )}
        </div>
        {parent ||
          (thread.reply && (
            <div className="w-0.5 h-[calc(100%-2.5rem)] bg-border absolute left-7.25 top-13 rounded-full group-active/postfeed:bg-transparent animated" />
          ))}
      </div>
      {thread.reply && (
        <PostReply thread={thread.reply} cardClassName="pt-2!" />
      )}
      {!noUnderline && (
        <div className="group-last-of-type/postfeed:hidden px-2">
          <div className="h-px w-full bg-border box-border rounded-full" />
        </div>
      )}
    </Component>
  );
};

export default PostFeed;
