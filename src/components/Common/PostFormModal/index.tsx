import { usePostMutation } from "@/app/features/posts/posts.api";
import { useAppForm } from "@/components/ui/form";
import z from "zod";
import Loader from "../Loader";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
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
import PostReply from "../Post/PostReply";
import useModal from "@/hooks/common/useModal";
import { usePostCacheUpdater } from "@/hooks/usePostCacheUpdater";

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

export type PostFormModalDetails = {
  isReplyingToThread?: boolean;
  navigateToThread?: string;
  reply: PublicPost | null;
};

const PostFormModal: FC<PostFormModalProps> = ({ onSubmit }) => {
  const { isOpen, payload, closeModal } =
    useModal<PostFormModalDetails>("post");
  const { profile } = useAuth();
  const { addPostToCache, replaceTempIdWithQueueId } = usePostCacheUpdater(
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

      const id = addPostToCache(parsed.data.content, parentId);

      await onSubmit?.(parsed.data.content, parentId);

      const postResponse = await post({
        content: parsed.data.content,
        parentId: parentId,
      });
      if (!postResponse.data) return;

      replaceTempIdWithQueueId(
        parsed.data.content,
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
            <Card className="p-2 px-3 w-full gap-0">
              {payload?.reply && (
                <div className="relative">
                  <PostReply
                    thread={payload.reply}
                    cardClassName="relative m-0! mb-3! pl-0! -left-1.5 gap-3.25!"
                    noLink
                    noActions
                    noUnderline
                  />
                  <div className="w-0.5 h-[calc(100%-2.5rem)] bg-border absolute left-4.75 top-10 rounded-full group-hover/postreply:bg-transparent animated transition-colors" />
                </div>
              )}
              <div className="flex gap-3 items-start w-full">
                <ProfileAvatar
                  className="size-10 rounded-full mt-1"
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
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PostFormModal;
