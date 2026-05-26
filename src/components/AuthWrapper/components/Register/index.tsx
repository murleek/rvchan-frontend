import { useRegisterMutation } from "@/app/features/auth/auth.api";
import Loader from "@/components/Common/Loader";
import PageLoader from "@/components/Common/PageLoader";
import { Button } from "@/components/ui/button";
import {
  FieldError,
  FieldGroup,
  FieldSet,
  FieldStatus,
} from "@/components/ui/field";
import { useAppForm } from "@/components/ui/form";
import { PAGES } from "@/constants";
import useAuth from "@/hooks/useAuth";
import { Plus } from "lucide-react";
import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router";
import z from "zod";
import type { AuthWrapperAction } from "../../types";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export const RegisterSchema = z
  .object({
    email: z
      .string()
      .nonempty({ message: "account.email.validation.required" })
      .pipe(z.email("account.email.validation.invalid")),
    password: z
      .string()
      .nonempty("account.password.validation.required")
      .min(6, "account.password.validation.min")
      .max(32, "account.password.validation.max"),
    repassword: z
      .string()
      .nonempty("account.repassword.validation.required")
      .min(6, "account.repassword.validation.min")
      .max(32, "account.repassword.validation.max"),
  })
  .refine((data) => data.password === data.repassword, {
    message: "account.repassword.validation.mismatch",
    path: ["repassword"],
  });

export type RegisterType = z.infer<typeof RegisterSchema>;

type RegisterProps = {
  onChangeAction?: (action: AuthWrapperAction) => void;
};

const Register: FC<RegisterProps> = ({ onChangeAction }) => {
  const auth = useAuth();
  const { profile, isLoading, login } = auth;

  const { t } = useTranslation("register");
  const { t: tCommon } = useTranslation();

  const [register] = useRegisterMutation();

  const [error, setError] = useState<string>("");

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      repassword: "",
    } as RegisterType,
    validators: {
      onSubmit: RegisterSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = RegisterSchema.safeParse(value);
      if (!parsed.success) return;

      const res = await register({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (!res.error) {
        const isLogged = await login({
          email: parsed.data.email,
          password: parsed.data.password,
        });

        if (isLogged) {
          form.reset();
          onChangeAction?.("init");
        } else {
          setError(t("error.failed_login"));
        }
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

  if (isLoading) {
    return <PageLoader label={tCommon("loader.profile")} className="h-56!" />;
  }
  if (profile) {
    if (profile.state === "INIT") {
      return <PageLoader label={tCommon("loader.profile")} className="h-56!" />;
    }
    return <Navigate to={PAGES.ROOT} replace />;
  }

  return (
    <>
      <CardHeader>
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground animated transition-colors text-sm">
            {t("description")}
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
          <FieldGroup className="h-full">
            <FieldSet className="max-xs:flex-1">
              <form.AppField
                name="email"
                children={(field) => <field.TextField t="account.email" />}
              />
              <form.AppField
                name="password"
                children={(field) => (
                  <field.PasswordField t="account.password" />
                )}
              />
              <form.AppField
                name="repassword"
                children={(field) => (
                  <field.PasswordField t="account.repassword" />
                )}
              />
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
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end mt-8 animated xs:mt-4 gap-2 max-xs:flex-col max-xs:items-stretch">
          <Button
            type="button"
            variant={"ghost"}
            onClick={() => onChangeAction?.("login")}
            className="text-primary"
          >
            {/* <Icon name="add" fill className="text-lg!" /> */}
            {t("login")}
          </Button>
          <form.Subscribe
            selector={(state) => [state.isSubmitting]}
            children={([isSubmitting]) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="size-4!" />
                    {tCommon("loader.loading")}
                  </>
                ) : (
                  <>
                    {/* <Icon name="login" fill className="text-lg!" /> */}
                    <Plus />
                    {t("submit")}
                  </>
                )}
              </Button>
            )}
          />
        </CardFooter>
      </form>
    </>
  );
};

export default Register;
