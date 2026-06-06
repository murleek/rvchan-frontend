import * as z from "zod";
import { Navigate, useLocation } from "react-router";
import type { AuthError } from "@/hooks/useAuth";
import useAuth from "@/hooks/useAuth";
import { useLayoutEffect, useState, type FC } from "react";
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
import { useRegisterMutation } from "@/app/features/auth/auth.api";

export const VerifySchema = z.object({
  email: z
    .string()
    .nonempty({ message: "account.email.validation.required" })
    .pipe(z.email("account.email.validation.invalid")),
  code: z.string().nonempty("account.code.validation.required"),
});

export type VerifyType = z.infer<typeof VerifySchema>;

type VerifyProps = {
  onChangeAction?: (action: AuthWrapperAction, payload?: object) => void;
  payload?: object;
};

const Verify: FC<VerifyProps> = ({ onChangeAction, payload }) => {
  const { login, profile, isLoading, isLogoutLoading, isAuthenticated } =
    useAuth();
  const { t } = useTranslation("verify");
  const { t: tCommon } = useTranslation();

  const [register] = useRegisterMutation();

  const location = useLocation();
  const redirectError: AuthError = location.state;

  const [error, setError] = useState<string>(
    (redirectError && "message" in redirectError && redirectError?.message) ||
      "",
  );

  const form = useAppForm({
    defaultValues: {
      email: payload && "email" in payload ? String(payload.email) : "",
      code: "",
    },
    validators: {
      onSubmit: VerifySchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = VerifySchema.safeParse(value);
      if (!parsed.success) return;

      const res = await register({
        email: parsed.data.email,
        code: parsed.data.code,
      });

      if (!res.error) {
        const isLogged = await login({
          email: parsed.data.email,
          password:
            payload && "password" in payload ? String(payload.password) : "",
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

  useLayoutEffect(() => {
    if (
      !isAuthenticated &&
      (!payload || !("email" in payload) || !("password" in payload))
    ) {
      onChangeAction?.("register");
    }
  }, [payload, isAuthenticated]);

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
            {t("description", {
              email: (payload && "email" in payload
                ? String(payload.email)
                : ""
              ).replace(
                /^(.)(.*)(.@.*)$/,
                (_, a, b, c) => a + b.replace(/./g, "*") + c,
              ),
            })}
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
            <FieldSet className="max-xs:flex-1 justify-center">
              <form.AppField
                name="code"
                children={(field) => (
                  <field.OtpField
                    t="account.otp"
                    className="**:justify-center"
                  />
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

export default Verify;
