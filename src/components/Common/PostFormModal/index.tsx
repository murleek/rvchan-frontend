import { postsApi, usePostMutation } from "@/app/features/posts/posts.api";
import { useAppForm } from "@/components/ui/form";
import z from "zod";
import Loader from "../Loader";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import { useAppDispatch } from "@/app/hooks";
import type { Profile } from "@/app/types/auth";
import type { PublicPost } from "@/app/types/post";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProfileAvatar from "../ProfileAvatar";
import { Card } from "@/components/ui/card";
import PostReply from "../PostReply";
import useModal from "@/hooks/common/useModal";

type PostFormModalProps = {
  username: string;
  onSubmit?: (content: string, parentId?: string) => Promise<void>;
};
const PostFormModalSchema = z.object({
  content: z
    .string()
    .refine(
      (value) => value.replaceAll(/\p{White_Space}/gu, "").length > 0,
      "Content cannot be empty or whitespace",
    ),
});
const usePosts = (profile: Profile | null, username: string) => {
  const dispatch = useAppDispatch();

  const makeTempId = () => `temp-id-${Date.now()}`;
  const makeQueueId = (queueId: string) => `job:${queueId}`;

  const buildPost = (
    content: string,
    parentId: string | null,
    id: string,
  ): PublicPost => ({
    id,
    user: profile!,
    content: content.trim(),
    parentId,
    replyCount: 0,
    likeCount: 0,
    createdAt: null,
    isLiked: false,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDataList = (draft: any, parentId?: string) => {
    if (parentId) return draft?.pages?.[0]?.replies?.data;
    return draft?.pages?.[0]?.data;
  };

  // ── unified cache operations ───────────────────────────────────────────
  const addPostToCache = (
    post: z.infer<typeof PostFormModalSchema>,
    parentId?: string,
  ) => {
    if (!profile) return;

    const tempId = makeTempId();
    const queryArgs = parentId
      ? { username: username, threadId: parentId }
      : { username: username };
    const endpoint = parentId ? "getPost" : "getUserThreads";

    dispatch(
      postsApi.util.updateQueryData(endpoint, queryArgs, (draft) => {
        getDataList(draft, parentId)?.unshift(
          buildPost(post.content, parentId ?? null, tempId),
        );
      }),
    );

    return tempId;
  };

  const replaceTempIdWithQueueId = (
    post: z.infer<typeof PostFormModalSchema>,
    tempId: string,
    queueId: string,
    parentId?: string,
  ) => {
    if (!profile) return;

    const queryArgs = parentId
      ? { username: username, threadId: parentId }
      : { username: username };
    const endpoint = parentId ? "getPost" : "getUserThreads";

    dispatch(
      postsApi.util.updateQueryData(endpoint, queryArgs, (draft) => {
        const data: PublicPost[] = getDataList(draft, parentId);
        if (!data) return;

        const index = data.findIndex((obj) => obj.id === tempId);
        if (index !== -1) {
          data[index].id = makeQueueId(queueId);
        } else {
          data.unshift(
            buildPost(post.content, parentId ?? null, makeQueueId(queueId)),
          );
        }
      }),
    );
  };

  return { addPostToCache, replaceTempIdWithQueueId };
};

export type PostFormModalDetails = {
  isReplyingToThread?: boolean;
  navigateToThread?: string;
  reply: PublicPost | null;
};

const PostFormModal: FC<PostFormModalProps> = ({ onSubmit }) => {
  const { isOpen, payload, closeModal } =
    useModal<PostFormModalDetails>("post");
  const { profile } = useAuth();
  const { addPostToCache, replaceTempIdWithQueueId } = usePosts(
    profile,
    payload?.reply ? payload.reply.user.username : "",
  );

  const [post] = usePostMutation();
  const form = useAppForm({
    defaultValues: {
      content: "",
    },
    validators: {
      onSubmit: PostFormModalSchema,
      onChange: PostFormModalSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = PostFormModalSchema.safeParse(value);
      if (!parsed.success) return;
      if (parsed.data.content.replaceAll(/\p{White_Space}/gu, "").length === 0)
        return;

      const parentId = payload?.reply ? String(payload?.reply?.id) : undefined;

      const id = addPostToCache(parsed.data, parentId);

      await onSubmit?.(parsed.data.content, parentId);

      const postResponse = await post({
        content: parsed.data.content,
        parentId: parentId,
      });
      if (!postResponse.data) return;

      replaceTempIdWithQueueId(
        parsed.data,
        id!,
        postResponse.data.jobId,
        parentId,
      );

      closeModal();
      form.reset();
    },
  });

  if (!profile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal()}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden max-md:h-full"
        aria-describedby={undefined}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="w-full flex flex-col overflow-auto items-stretch"
        >
          <div className="md:rounded-t-xl backdrop-blur-xs mask-b-from-40% mask-b-to-100% absolute left-0 top-0 bottom-0 pointer-events-none z-1 w-full h-20" />
          <div className="md:rounded-t-xl mask-b-from-10% mask-b-to-80% bg-background/80 absolute left-0 top-0 bottom-0 pointer-events-none z-1 w-full h-20 animated transition-colors" />
          <DialogHeader className="p-5 py-4 absolute top-0 left-0 w-full z-10">
            <DialogTitle>
              <span className="text-lg font-bold ">
                {payload?.reply ? "Ответ на публикацию" : "Новая публикация"}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="w-full flex flex-col gap-2 p-5 pt-16 flex-1">
            {payload?.reply && (
              <div className="relative [zoom:90%] px-6">
                <PostReply
                  thread={payload.reply}
                  cardClassName="bg-white md:border"
                  noLink
                  noActions
                />
                <div className="absolute left-1/2 -translate-x-1/2 bg-white md:bg-border top-[calc(100%-4px)] h-3.25 w-1" />
              </div>
            )}
            <Card className="p-2 px-3 w-full flex-row gap-3">
              <ProfileAvatar
                className="size-10 rounded-full"
                src={profile.avatar}
                alt={`${profile.firstName}'s (@${profile.username}) avatar`}
              />
              <div className="w-full">
                <span className="text-sm/4 font-extrabold">
                  {profile.firstName} {profile.lastName}
                </span>
                <div className="text-[15px] leading-5.5 whitespace-pre-wrap">
                  <form.AppField
                    name="content"
                    children={(field) => (
                      <field.TextareaField
                        t="content"
                        tws="posts"
                        label={null}
                        className="max-h-none pt-0.75 px-0 min-h-auto resize-none has-[&]:has-focus-visible:ring-0! h-auto"
                        wrapClassName="border-0 ring-0! border-0 shadow-none rounded-none bg-transparent!"
                        hideError
                      />
                    )}
                  />
                </div>
              </div>
            </Card>
          </div>
          <div className="md:rounded-t-xl backdrop-blur-xs mask-t-from-40% mask-t-to-100% absolute left-0 bottom-0 pointer-events-none z-1 w-full h-20" />
          <div className="md:rounded-t-xl mask-t-from-10% mask-t-to-80% bg-background/80 absolute left-0 bottom-0 pointer-events-none z-1 w-full h-20 animated transition-colors" />
          <DialogFooter className="p-2 px-7 sticky bottom-0 z-10">
            <form.Subscribe
              selector={(state) => [state.isSubmitting, state.isFormValid]}
              children={([isSubmitting, isValid]) => (
                <Button
                  type="submit"
                  className="rounded-full h-12 font-black text-md w-full z-10"
                  disabled={isSubmitting || !isValid}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="size-4!" />
                      Публикую...
                    </>
                  ) : (
                    <>Опубликовать</>
                  )}
                </Button>

                // <Button
                //   disabled={isLoading}
                //   className="rounded-full h-10 font-black text-md"
                //   variant="destructive"
                //   onClick={() => logoutDevice(device.id)}
                // >
                //   {isLoading ? (
                //     <>
                //       <Loader className={"size-4!"} />
                //       {t("devices.logout.loading")}
                //     </>
                //   ) : (
                //     t("devices.logout.button")
                //   )}
                // </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PostFormModal;
