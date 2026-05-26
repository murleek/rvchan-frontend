import * as z from "zod";
import { Navigate, useLocation } from "react-router";
import type { AuthError } from "@/hooks/useAuth";
import useAuth from "@/hooks/useAuth";
import { useState, type FC } from "react";
import { PAGES } from "@/constants";
import PageLoader from "@/components/Common/PageLoader";
import { useAppForm } from "../../../ui/form";
import {
  FieldError,
  FieldGroup,
  FieldSet,
  FieldStatus,
} from "../../../ui/field";
import { Button } from "../../../ui/button";
import { useTranslation } from "react-i18next";
import { LogIn } from "lucide-react";
import Loader from "@/components/Common/Loader";
import type { AuthWrapperAction } from "../../types";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export const LoginSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "account.email.validation.required" })
    .pipe(z.email("account.email.validation.invalid")),
  password: z.string().nonempty("account.password.validation.required"),
});

export type LoginType = z.infer<typeof LoginSchema>;

type LoginProps = {
  onChangeAction?: (action: AuthWrapperAction) => void;
};

const Login: FC<LoginProps> = ({ onChangeAction }) => {
  const { login, profile, isLoading, isLogoutLoading, isAuthenticated } =
    useAuth();
  const { t } = useTranslation("login");
  const { t: tCommon } = useTranslation();

  const location = useLocation();
  const redirectError: AuthError = location.state;

  const [error, setError] = useState<string>(
    (redirectError && "message" in redirectError && redirectError?.message) ||
      "",
  );

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    } as LoginType,
    validators: {
      onSubmit: LoginSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = LoginSchema.safeParse(value);
      if (!parsed.success) return;

      const res = await login({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (res.success) {
        form.reset();
        if (res.data?.state === "INIT") {
          onChangeAction?.("init");
        } else {
          window.location.href = PAGES.ROOT;
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

  if (isLoading || isLogoutLoading || isAuthenticated) {
    return <PageLoader label={tCommon("loader.profile")} className="h-56!" />;
  }
  if (profile) {
    if (profile.state === "INIT") {
      return <PageLoader label={tCommon("loader.profile")} className="h-56!" />;
    }
    return <Navigate to={redirectError?.redirect || PAGES.ROOT} replace />;
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
            onClick={() => onChangeAction?.("register")}
            className="text-primary"
          >
            {/* <Icon name="add" fill className="text-lg!" /> */}
            {t("register")}
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
                    <LogIn />
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

export default Login;
