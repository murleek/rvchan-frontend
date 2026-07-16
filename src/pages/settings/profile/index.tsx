import { useCallback, useRef, useState } from "react";
import { Image } from "lucide-react";
import { useTranslation } from "react-i18next";
import { revalidateLogic } from "@tanstack/react-form";
import {
  useEditProfileMutation,
  useLazyCheckUsernameQuery,
  useUploadAvatarMutation,
} from "@/app/features/user/user.api";
import ImageEditorModal from "@/components/Common/ImageEditor";
import ProfileAvatar from "@/components/Common/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FieldError,
  FieldGroup,
  FieldDescription,
  FieldSet,
  FieldStatus,
} from "@/components/ui/field";
import { useAppForm } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";
import z from "zod";
import { useHeader } from "@/hooks/common/useHeader";
import { Separator } from "@/components/ui/separator";

const BaseEditProfileSchema = z.object({
  firstName: z
    .string()
    .nonempty("account.firstName.validation.required")
    .optional(),
  lastName: z.string().max(32).optional(),
  description: z.string().max(320).optional(),
  isPrivate: z.boolean().optional(),
});

const ProfileSettings = () => {
  const { profile, updateProfile } = useAuth();
  const [checkUsername] = useLazyCheckUsernameQuery();
  const [editProfile] = useEditProfileMutation();
  const [uploadAvatar] = useUploadAvatarMutation();
  const [isImageUploading, setIsImageUploading] = useState(false);

  // const [loadPercentage, setLoadPercentage] = useState<number | null>(null);

  const avatarRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<File | null>(null);

  const handleLoadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSaveAvatar = async (image: File) => {
    if (!image) return;

    const formData = new FormData();
    formData.append("avatar", image);

    setIsImageUploading(true);
    await uploadAvatar(formData).unwrap();

    await updateProfile();

    setImage(null);
    setIsImageUploading(false);

    // setLoadPercentage(null);
  };

  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("settings");

  const [error, setError] = useState<string>("");

  const EditProfileSchema = BaseEditProfileSchema.extend({
    username: z.string().superRefine((v, ctx) => {
      const isIdFormat = v.startsWith("id") && /^\d+$/.test(v.slice(2));

      if (!isIdFormat) {
        if (!v) {
          return;
        }

        if (v.length < 5) {
          ctx.addIssue({
            code: "too_small",
            minimum: 5,
            type: "string",
            inclusive: true,
            message: "account.username.validation.minLength",
            origin: "validation",
          });
        }

        if (v.length > 32) {
          ctx.addIssue({
            code: "too_big",
            origin: "validation",
            maximum: 32,
            type: "string",
            inclusive: true,
            message: "account.username.validation.maxLength",
          });
        }
      }
    }),
  });
  type EditProfileType = z.infer<typeof EditProfileSchema>;

  const form = useAppForm({
    defaultValues: {
      username: profile?.username || "",
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      description: profile?.description || "",
      isPrivate: profile?.isPrivate || false,
    } as EditProfileType,

    validationLogic: revalidateLogic(),
    validators: {
      onChange: EditProfileSchema,
      onSubmit: EditProfileSchema,
    },
    onSubmit: async ({ value }) => {
      value = {
        ...value,
        username: value.username.trim().length
          ? value.username.trim()
          : `id${profile?.id}`,
      };
      const parsed = await EditProfileSchema.safeParseAsync(value);
      if (!parsed.success) return;
      const res = await editProfile(parsed.data);

      if (!res.error) {
        setError("");
      } else {
        const message =
          res.error &&
          "data" in res.error &&
          typeof res.error.data === "object" &&
          res.error.data !== null &&
          "message" in res.error.data
            ? (res.error.data as { message: string })?.message
            : (("status" in res.error && res.error?.status) ?? "failed");
        setError(tCommon("error." + message));
      }
    },
  });

  useHeader("", {
    onClick: useCallback(() => {
      console.log("test");
      if (!isImageUploading || !form.state.isSubmitting) {
        form.handleSubmit();
      }
    }, [isImageUploading, form]),
    isClickable: !isImageUploading || !form.state.isSubmitting,
  });

  return (
    <div>
      <ImageEditorModal
        open={!!image}
        onOpenChange={(x) => setImage(x ? image : null)}
        image={image}
        onSave={handleSaveAvatar}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="h-full"
      >
        <FieldSet className="h-full grid">
          <div className="flex flex-col items-center gap-3">
            <ProfileAvatar
              className="size-24 rounded-full"
              src={profile?.avatar}
            />

            <Button
              variant="ghost"
              className="text-primary relative top-0"
              onClick={() => avatarRef.current?.click()}
              disabled={isImageUploading || form.state.isSubmitting}
            >
              <Input
                ref={avatarRef}
                type="file"
                className="bg-card opacity-0 h-full w-full absolute pointer-events-none"
                placeholder="tests"
                onChange={handleLoadAvatar}
              />
              <Image />{" "}
              {isImageUploading
                ? t("profile.avatarLoading", {
                    loading: "",
                    // loadPercentage !== null
                    //   ? t("percentage", {
                    //       percentage: Math.round(loadPercentage),
                    //     })
                    //   : "",
                  })
                : t("profile.changeAvatar")}
            </Button>
            {/* <pre>{JSON.stringify(uploadError, null, 2)}</pre> */}
          </div>
          {/* <Card className="p-4">
            <Field>
              <FieldLabel htmlFor="picture">Аватар</FieldLabel>
              <div className="flex gap-3 items-center"></div>
            </Field>
          </Card> */}
          <FieldGroup className="gap-1.5">
            <Card className="p-0 px-4 block gap-0 bg-card">
              <form.AppField
                name="firstName"
                children={(field) => (
                  <field.TextField
                    t="account.firstName"
                    label={null}
                    className="px-0 py-3 border-0 shadow-none rounded-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 h-auto bg-transparent!"
                    required
                  />
                )}
              />
              <Separator className="shrink-0" />
              <form.AppField
                name="lastName"
                children={(field) => (
                  <field.TextField
                    t="account.lastName"
                    label={null}
                    className="px-0 py-3 border-0 shadow-none rounded-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 h-auto bg-transparent!"
                  />
                )}
              />
            </Card>
            <FieldDescription className="text-xs px-4">
              {t("profile.nameDescription")}
            </FieldDescription>
          </FieldGroup>
          <FieldGroup className="gap-1.5">
            <Card className="p-0 block gap-0 overflow-hidden">
              <form.AppField
                name="description"
                children={(field) => (
                  <field.TextareaField
                    t="account.description"
                    label={null}
                    className="max-h-32 px-4 min-h-auto resize-none py-3 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 h-auto"
                    wrapClassName="border-0 ring-0 border-0 shadow-none rounded-none"
                  />
                )}
              />
            </Card>
            <FieldDescription className="text-xs px-4">
              {t("profile.descriptionDescription")}
            </FieldDescription>
          </FieldGroup>
          <FieldGroup className="gap-1.5 ">
            <Card className="p-0 px-4 block gap-0 py-3">
              <form.AppField
                validators={{
                  onChangeAsyncDebounceMs: 500,
                  onChangeAsync: async ({ value }) => {
                    if (!value) return;
                    const { data, error } = await checkUsername(value);

                    if (error || !data?.available) {
                      return {
                        message: `account.username.validation.${data?.message || "unavailable"}`,
                        origin: "validation",
                      };
                    }
                  },
                }}
                name="username"
                children={(field) => (
                  <field.TextField
                    t="account.username"
                    tParams={{
                      minLength: 5,
                      maxLength: 32,
                      id: `id${profile?.id}`,
                    }}
                    placeholder={profile?.id ? "id" + profile?.id : undefined}
                    hasValid={
                      !!field.state?.value && !field.state?.meta?.errors?.length
                    }
                  />
                )}
              />
            </Card>
          </FieldGroup>

          <form.AppField
            name="isPrivate"
            children={(field) => (
              <field.SwitchField
                t="account.isPrivate"
                className="max-md:border-0"
              />
            )}
          />

          <FieldError>
            {error && (
              <FieldStatus
                className="bg-muted rounded-md py-3 px-4 font-medium text-base/5"
                iconClassName="size-5!"
                status={"error"}
              >
                {error}
              </FieldStatus>
            )}
          </FieldError>
        </FieldSet>

        {/* <div className="justify-end mt-8 md:mt-4 gap-2 max-xs:flex-col max-xs:items-stretch">
          <form.Subscribe
            selector={(state) => [state.isSubmitting]}
            children={([isSubmitting]) => (
              <Button type="submit" disabled={isSubmitting || isLoading}>
                {isLoading
                  ? tCommon("loader.sending")
                  : isSubmitting
                    ? tCommon("loader.init")
                    : "Сохранить"}
                <ArrowRight />
              </Button>
            )}
          />
        </div> */}
      </form>
    </div>
  );
};

export default ProfileSettings;
