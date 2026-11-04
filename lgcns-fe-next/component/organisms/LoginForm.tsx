"use client";

import { startTransition, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import ErrorMessage from "../atoms/ErrorMessage";
import FormField from "../molecules/FormField";
import initialValues from "@/types/initial/loginInitial";
import { UserPayloadType } from "@/types/request/RequestType";
import { emptyErrors } from "@/types/error/loginError";
import loginSchema, { loginFieldMessage } from "@/schema/loginSchema";

type LoginFieldName = keyof UserPayloadType;

function LoginSubmitButton({ isValid, isPending }: { isValid: boolean; isPending: boolean }) {
  console.log("isPending", isPending);
  return (
    <Button type="submit" disabled={!isValid || isPending} aria-busy={isPending}>
      {isPending ? "Logging in..." : "Login"}
    </Button>
  );
}

export default function LoginForm() {
  const [payload, setPayload] = useState(initialValues);
  const [errors, setErrors] = useState(emptyErrors);
  const [formError, setFormError] = useState("");
  const isValid = loginSchema.safeParse(payload).success;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name !== "userId" && name !== "password") return;
    const field: LoginFieldName = name;
    setPayload((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]: loginFieldMessage(field, value),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;
    startTransition( async () => {
      await signIn("credentials", {
        email: payload.userId,
        password: payload.password,
        redirect: true, 
        callbackUrl: "/",
      });
    });
    setFormError("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        id="userId"
        type="text"
        name="userId"
        placeholder="ID"
        value={payload.userId}
        error={errors.userId}
        isClearable={true}
        onChange={handleChange}
      />
      <FormField
        id="password"
        type="password"
        name="password"
        placeholder="Password"
        value={payload.password}
        error={errors.password}
        isClearable={true}
        onChange={handleChange}
      />
      <ErrorMessage id="login-error" error={formError} />
      <LoginSubmitButton isValid={isValid} isPending={isPending} />
    </form>
  );
}
