import useAuth from "@/hooks/useAuth";
import { memo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import z from "zod";
import { revalidateLogic } from "@tanstack/react-form";
import { ArrowRight, LogOut } from "lucide-react";
import {
  useInitUserMutation,
  useLazyCheckUsernameQuery,
} from "@/app/features/user/user.api";
import { useAppForm } from "../../../ui/form";
import {
  FieldError,
  FieldGroup,
  FieldSet,
  FieldStatus,
} from "../../../ui/field";
import { Button } from "../../../ui/button";
import type { OnChangeActionFn } from "../../types";
import PageLoader from "@/components/Common/PageLoader";
import { PAGES } from "@/constants";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";

type InitPageProps = {
  onChangeAction?: OnChangeActionFn;
};

export const BaseInitSchema = z.object({
  firstName: z.string().nonempty("account.firstName.validation.required"),
  lastName: z.string().nullable(),
  description: z.string().max(320).nullable(),
});

const InitPage: FC<InitPageProps> = ({ onChangeAction }) => {
  const { profile, logout, isLogoutLoading, isAuthenticated } = useAuth();
  const [checkUsername] = useLazyCheckUsernameQuery();

  const { t } = useTranslation("init");
  const { t: tCommon } = useTranslation("common");

  const [error, setError] = useState<string>("");

  const [init, { isLoading }] = useInitUserMutation();

  const InitSchema = BaseInitSchema.extend({
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

  type InitType = z.infer<typeof InitSchema>;

  const form = useAppForm({
    defaultValues: {
      username: profile?.username || "",
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      description: profile?.description || "",
    } as InitType,
    // validationLogic: revalidateLogic({
    //   mode: "submit",
    //   modeAfterSubmission: "blur",
    // }),

    validationLogic: revalidateLogic(),
    validators: {
      onChange: InitSchema,
      onSubmit: InitSchema,
    },
    onSubmit: async ({ value }) => {
      value = {
        ...value,
        username: value.username.trim().length
          ? value.username.trim()
          : `id${profile?.id}`,
      };
      const parsed = await InitSchema.safeParseAsync(value);
      if (!parsed.success) return;
      const res = await init(parsed.data);

      if (!res.error) {
        form.reset();
        window.location.href = PAGES.ROOT;
      } else {
        const message =
          res.error &&
          "data" in res.error &&
          typeof res.error.data === "object" &&
          res.error.data !== null &&
          "message" in res.error.data
            ? (res.error.data as { message: string })?.message
            : (("status" in res.error && res.error?.status) ?? "failed");
        setError(t("error." + message));
      }
    },
  });

  const handleLogout = async () => {
    await logout(false);
    // window.location.href = PAGES.LOGIN;
    onChangeAction?.("login");
  };

  if (!profile || isLoading || !isAuthenticated) {
    return <PageLoader label={tCommon("loader.init")} className="h-56!" />;
  }
  if (isLogoutLoading) {
    return (
      <PageLoader label={tCommon("loader.logging_out")} className="h-56!" />
    );
  }

  if (profile.state !== "INIT") {
    window.location.href = PAGES.ROOT;
    return <PageLoader label={tCommon("loader.init")} className="h-56!" />;
  }

  return (
    <>
      <CardHeader>
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground animated transition-colors text-sm">
            {t("description")}{" "}
          </p>
        </div>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="h-full"
      >
        <CardContent>
          <FieldSet className="max-xs:flex-1">
            <FieldGroup className="h-full">
              <form.AppField
                name="firstName"
                children={(field) => (
                  <field.TextField t="account.firstName" required />
                )}
              />
              <form.AppField
                name="lastName"
                children={(field) => <field.TextField t="account.lastName" />}
              />
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
              <form.AppField
                name="description"
                children={(field) => (
                  <field.TextareaField
                    className="max-h-32"
                    t="account.description"
                  />
                )}
              />
            </FieldGroup>
          </FieldSet>

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
        </CardContent>

        <CardFooter className="justify-end mt-8 md:mt-4 gap-2 max-xs:flex-col max-xs:items-stretch">
          <Button type="button" variant={"destructive"} onClick={handleLogout}>
            {/* <Icon name="logout" fill className="text-lg!" /> */}
            <LogOut />
            {t("logout")}
          </Button>
          <form.Subscribe
            selector={(state) => [state.isSubmitting]}
            children={([isSubmitting]) => (
              <Button type="submit" disabled={isSubmitting || isLoading}>
                {isLoading
                  ? tCommon("loader.sending")
                  : isSubmitting
                    ? tCommon("loader.init")
                    : t("submit")}
                {/* <Icon name="arrow_forward" fill className="text-lg!" /> */}
                <ArrowRight />
              </Button>
            )}
          />
        </CardFooter>
      </form>
    </>
  );
};

export default memo(InitPage);
