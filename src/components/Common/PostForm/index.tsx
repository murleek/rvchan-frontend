import { usePostMutation } from "@/app/features/posts/posts.api";
import { useAppForm } from "@/components/ui/form";
import { ArrowUp } from "lucide-react";
import z from "zod";
import Loader from "../Loader";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import useAuth from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { usePostCacheUpdater } from "@/hooks/usePostCacheUpdater";

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
  const { addPostToCache, replaceTempIdWithQueueId } =
    usePostCacheUpdater(username);
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
      const id = addPostToCache(parsed.data.content, parentId);

      await onSubmit?.(parsed.data.content, parentId);

      const postResponse = await post({
        content: parsed.data.content,
        parentId,
      });
      if (!postResponse.data) return;

      replaceTempIdWithQueueId(
        parsed.data.content,
        id!,
        postResponse.data.jobId,
        parentId,
      );

      form.reset();
    },
  });

  if (!profile) return null;

  return (
    <div
      className={clsx(
        "w-full p-0 border z-10 rounded-[28px] bg-background relative",
        className,
      )}
      {...rest}
    >
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
                className="max-h-32 px-5 min-h-auto resize-none py-4 pr-15 has-[&]:has-focus-visible:ring-0! h-auto bg-transparent!"
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
                className="flex-none py-1 w-11 h-11 px-2 rounded-full p-1! disabled:pointer-events-none disabled:cursor-pointer disabled:opacity-50 disabled:bg-muted-foreground absolute bottom-1.5 md:bottom-1 right-1"
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
    </div>
  );
};

export default PostForm;
