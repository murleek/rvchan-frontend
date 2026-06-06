import { postsApi, usePostMutation } from "@/app/features/posts/posts.api";
import { useAppForm } from "@/components/ui/form";
import { ArrowUp } from "lucide-react";
import z from "zod";
import Loader from "../Loader";
import { Card } from "@/components/ui/card";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import useAuth from "@/hooks/useAuth";
import { useAppDispatch } from "@/app/hooks";
import type { Profile } from "@/app/types/auth";
import type { PublicPost } from "@/app/types/post";
import { useTranslation } from "react-i18next";

type PostFormProps = {
  parentId?: string;
  username: string;
  onSubmit?: (content: string, parentId?: string) => Promise<void>;
  disabled?: boolean;
};

const PostFormSchema = z.object({
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
    post: z.infer<typeof PostFormSchema>,
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
    post: z.infer<typeof PostFormSchema>,
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

const PostForm: FC<PostFormProps & React.HTMLAttributes<HTMLDivElement>> = ({
  parentId,
  username,
  onSubmit,
  className,
  disabled,
  ...rest
}) => {
  const { profile } = useAuth();
  const { t } = useTranslation("posts");
  const { addPostToCache, replaceTempIdWithQueueId } = usePosts(
    profile,
    username,
  );
  const [post] = usePostMutation();
  const form = useAppForm({
    defaultValues: {
      content: "",
    },
    validators: {
      onSubmit: PostFormSchema,
      onChange: PostFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = PostFormSchema.safeParse(value);
      if (!parsed.success) return;
      if (parsed.data.content.replaceAll(/\p{White_Space}/gu, "").length === 0)
        return;

      console.log(parentId);
      const id = addPostToCache(parsed.data, parentId);

      await onSubmit?.(parsed.data.content, parentId);

      const postResponse = await post({
        content: parsed.data.content,
        parentId,
      });
      if (!postResponse.data) return;

      replaceTempIdWithQueueId(
        parsed.data,
        id!,
        postResponse.data.jobId,
        parentId,
      );

      form.reset();
    },
  });

  if (!profile) return null;

  return (
    <Card className={clsx("w-full p-0 inset-shadow-glow", className)} {...rest}>
      {disabled ? (
        <div className="flex items-center justify-center h-10 text-sm font-bold text-muted-foreground">
          Публикация недоступна.
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="gap-1 items-center w-full flex-none"
        >
          <form.AppField
            name="content"
            children={(field) => (
              <field.TextareaField
                t="content"
                tws="posts"
                placeholder={
                  parentId ? t("placeholder.reply") : t("placeholder.thread")
                }
                label={null}
                className="max-h-32 px-4 min-h-auto resize-none py-2.5 pr-13 has-[&]:has-focus-visible:ring-0! h-auto"
                wrapClassName="border-0 ring-0! border-0 shadow-none rounded-none bg-transparent!"
                hideError
              />
            )}
          />

          <form.Subscribe
            selector={(state) => [state.isSubmitting, state.isFormValid]}
            children={([isSubmitting, isValid]) => (
              <Button
                type="submit"
                className="flex-none py-1 w-10 h-8 px-2 rounded-full p-1! disabled:pointer-events-none disabled:cursor-pointer disabled:opacity-50 disabled:bg-muted-foreground absolute bottom-1.5 md:bottom-1 right-1"
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="size-4!" />
                  </>
                ) : (
                  <>
                    <ArrowUp className="size-5.5" strokeWidth="3" />
                  </>
                )}
              </Button>
            )}
          />
        </form>
      )}
    </Card>
  );
};

export default PostForm;
