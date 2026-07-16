import ProfileAvatar from "../ProfileAvatar";
import { type FC } from "react";
import type { PublicPost, TextEntity } from "@/app/types/post";
import useRelativeTime from "@/hooks/useRelativeTime";
import { MessageCircle } from "lucide-react";
import clsx from "clsx";
import Loader from "../Loader";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { PAGES } from "@/constants";
import LikeButton from "./components/LikeButton";

type PostProps = {
  thread: PublicPost;
  className?: string;
  notEntriable?: boolean;
  noUnderline?: boolean;
  forceUnderline?: boolean;
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

  if (lastIndex < content.length) {
    result.push(<span key="tail">{content.slice(lastIndex)}</span>);
  }

  return result;
}

const Post: FC<PostProps> = ({
  thread,
  className,
  notEntriable,
  noUnderline,
  forceUnderline,
}) => {
  const { t } = useTranslation("posts");
  const navigate = useNavigate();
  const time = useRelativeTime(
    thread.createdAt || new Date().toString(),
    "long",
  );
  const Component = !notEntriable ? Link : "div";
  const props: { to: string } | { to: never } = !notEntriable
    ? {
        // to: `/${thread.user.username}/post/${thread.id}`,
        to: PAGES.POST.replaceAll(":username", thread.user.username).replaceAll(
          ":id",
          String(thread.id),
        ),
      }
    : ({} as { to: never });
  return (
    <Component className={clsx("group/post")} {...props}>
      <div
        className={clsx(
          "p-2 not-first:border-t animated flex items-start flex-col gap-1 rounded-lg m-1 relative z-1 ring-1 ring-transparent",
          className,
          !thread.createdAt
            ? "opacity-50 animate-pulse"
            : !notEntriable &&
                "active:scale-[106%] active:bg-card active:ring-border cursor-pointer",
        )}
      >
        <div
          onClick={() =>
            navigate(PAGES.USER.replaceAll(":username", thread.user.username))
          }
          className="cursor-pointer flex w-full gap-3 p-1 hover:bg-black/8 rounded-sm animated"
        >
          <ProfileAvatar
            className="size-10 rounded-full"
            src={thread.user.avatar}
            alt={`${thread.user.firstName}'s (@${thread.user.username}) avatar`}
          />

          <div className="flex flex-col justify-center flex-1">
            <div
              className={clsx(
                "flex gap-1 w-full flex-col",
                !thread.createdAt && "justify-between",
              )}
            >
              <span className="text-sm/4 font-extrabold">
                {thread.user.firstName} {thread.user.lastName}
              </span>
              <span className="text-sm/4 text-muted-foreground flex items-center gap-1.5">
                {thread.createdAt ? (
                  time
                ) : (
                  <>
                    <Loader className="size-4!" /> {t("posting")}
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className=" px-1 pb-1 w-full">
          <div className="text-[15px] mt-0.75 leading-5.5 whitespace-pre-wrap">
            {renderTextWithEntities(thread.content, thread.entities)}
          </div>
          <div className="flex mt-1 text-sm text-muted-foreground gap-1">
            <LikeButton thread={thread} />
            <button className="flex gap-1 items-center hover:cursor-pointer hover:bg-black/8 animated px-3 py-2 rounded-xl group/button color-muted-foreground hover:color-blue-500!">
              <MessageCircle className="size-4.5 animated fill-transparent group-hover/button:fill-current group-active/button:scale-80" />
              <span className="text-xs font-bold tabular-nums">
                {thread.replyCount}
              </span>
            </button>
          </div>
        </div>
      </div>
      {!noUnderline && (
        // <div
        //   className={clsx(
        //     "h-0.5 w-full bg-border px-2 box-border",
        //     !forceUnderline && "group-last-of-type/post:hidden",
        //   )}
        // />
        <div
          className={clsx(
            "px-2",
            !forceUnderline && "group-last-of-type/post:hidden",
          )}
        >
          <div className="h-px w-full bg-border box-border rounded-full" />
        </div>
      )}
    </Component>
  );
};

export default Post;
