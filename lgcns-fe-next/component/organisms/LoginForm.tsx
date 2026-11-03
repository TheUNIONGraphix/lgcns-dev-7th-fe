"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";

import { Button } from "@/components/ui/button";
import ErrorMessage from "../atoms/ErrorMessage";
import FormField from "../molecules/FormField";
import initialValues from "@/types/initial/loginInitial";
import { UserPayloadType } from "@/types/request/RequestType";
import { emptyErrors } from "@/types/error/loginError";
import loginSchema, { loginFieldMessage } from "@/schema/loginSchema";

type LoginFieldName = keyof UserPayloadType;

function LoginSubmitButton({ isValid, pending }: { isValid: boolean; pending: boolean }) {
  return (
    <Button type="submit" disabled={!isValid || pending} aria-busy={pending}>
      {pending ? "로그인중" : "Login"}
    </Button>
  );
}

export default function LoginForm() {
  const [payload, setPayload] = useState(initialValues);
  const [errors, setErrors] = useState(emptyErrors);
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const isValid = loginSchema.safeParse(payload).success;
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn, router]);

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || pending) return;

    setPending(true);
    setFormError("");
    const result = await signIn("credentials", {
      email: payload.userId,
      password: payload.password,
      redirect: false,
    });

    if (result?.ok) {
      router.replace("/");
      router.refresh();
      return;
    }

    setPending(false);
    setFormError("이메일 또는 비밀번호가 올바르지 않습니다.");
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
      <LoginSubmitButton isValid={isValid} pending={pending} />
    </form>
  );
}
