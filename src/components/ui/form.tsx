import { createFormHookContexts, createFormHook } from "@tanstack/react-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "./field";
import { Input } from "./input";
import { useTranslation } from "react-i18next";
import { Textarea } from "./textarea";
import { Switch } from "./switch";

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, PasswordField, TextareaField, SwitchField },
  formComponents: {},
});

function TextField(
  props: {
    placeholder?: string;
    className?: string;
    hasValid?: boolean;
    required?: boolean;
    orientation?: "horizontal" | "vertical";
  } & (
    | { t: string; tParams?: Record<string, any>; label?: string | null }
    | { t: never; tParams: never; label: string | null }
  ),
) {
  const { t } = useTranslation();
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const isValid = field.state.meta.isTouched && field.state.meta.isValid;

  const errorsObj = [
    ...field.state.meta.errors,
    props.hasValid &&
      isValid &&
      (field.state.meta.isValidating
        ? {
            message: t(`${props.t}.validation.validating`),
            status: "default",
            key: "validating",
          }
        : { message: t(`${props.t}.validation.valid`), status: "valid" }),
  ].filter(Boolean) as Array<{
    message?: string;
    status?: "error" | "valid" | "default";
  }>;

  return (
    <Field data-invalid={isInvalid} orientation={props.orientation}>
      {props.label !== null && (
        <FieldLabel htmlFor={field.name}>
          {props.t ? (props.label ?? t(`${props.t}.label`)) : props.label}
          {props.required && (
            <span aria-hidden="true" className="text-red-500">
              *
            </span>
          )}
        </FieldLabel>
      )}
      <div>
        <Input
          type="string"
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          className={props.className}
          placeholder={
            props.t
              ? (props.placeholder ?? t(`${props.t}.placeholder`))
              : props.placeholder
          }
          autoComplete="off"
        />

        <FieldError
          tParams={props.t ? props.tParams : undefined}
          errors={errorsObj}
        />
      </div>
    </Field>
  );
}

function PasswordField(
  props: { placeholder?: string; className?: string } & (
    | { t: string; label?: string | null }
    | { t: never; label: string | null }
  ),
) {
  const { t } = useTranslation();
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      {props.label !== null && (
        <FieldLabel htmlFor={field.name}>
          {props.t ? (props.label ?? t(props.t + ".label")) : props.label}
        </FieldLabel>
      )}
      <div>
        <Input
          type="password"
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          className={props.className}
          placeholder={
            props.t
              ? (props.placeholder ?? t(`${props.t}.placeholder`))
              : props.placeholder
          }
          autoComplete="off"
        />
        <FieldError errors={field.state.meta.errors} />
      </div>
    </Field>
  );
}

function TextareaField(
  props: {
    placeholder?: string;
    className?: string;
    wrapClassName?: string;
    hideError?: boolean;
  } & (
    | { t: string; tws?: string; label?: string | null }
    | { t: never; tws?: never; label: string | null }
  ),
) {
  const { t } = useTranslation(props.tws);
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      {props.label !== null && (
        <FieldLabel htmlFor={field.name}>
          {props.t ? (props.label ?? t(props.t + ".label")) : props.label}
        </FieldLabel>
      )}
      <div>
        <Textarea
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          className={props.className}
          wrapClassName={props.wrapClassName}
          placeholder={
            props.t
              ? (props.placeholder ?? t(`${props.t}.placeholder`))
              : props.placeholder
          }
          autoComplete="off"
        />
        {!props.hideError && <FieldError errors={field.state.meta.errors} />}
      </div>
    </Field>
  );
}

function SwitchField(
  props: {
    placeholder?: string;
    className?: string;
  } & ({ t: string; label?: string } | { t: never; label: string }),
) {
  const field = useFieldContext<boolean>();
  const { t } = useTranslation();

  return (
    <FieldGroup>
      <FieldLabel
        htmlFor={field.name}
        className="rounded-xl! bg-card transition-colors"
      >
        <Field orientation={"horizontal"}>
          <FieldContent>
            <FieldTitle>
              {props.t ? (props.label ?? t(props.t + ".label")) : props.label}
            </FieldTitle>
            <FieldDescription className="text-sm text-muted-foreground">
              {props.t ? t(props.t + ".description") : props.placeholder}
            </FieldDescription>
            <FieldError errors={field.state.meta.errors} />
          </FieldContent>

          <Switch
            id={field.name}
            name={field.name}
            checked={field.state.value}
            onBlur={field.handleBlur}
            onCheckedChange={(e) => field.handleChange(e)}
            className={props.className}
          />
        </Field>
      </FieldLabel>
    </FieldGroup>
  );
}
