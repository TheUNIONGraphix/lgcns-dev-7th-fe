"use client";

import { useState } from "react";

import Form from "next/form";
import { Button } from "@/components/ui/button";
import FormField from "../molecules/FormField";
import initialValues from "@/types/initial/loginInitial";
import { UserPayloadType } from "@/types/request/RequestType";
import { emptyErrors } from "@/types/error/loginError";
import loginSchema, { loginFieldMessage } from "@/schema/loginSchema";

type LoginFieldName = keyof UserPayloadType;

export default function LoginForm({
  handleSubmit,
}: {
  handleSubmit: (formData: FormData) => void;
}) {
  const [payload, setPayload] = useState(initialValues);
  const [errors, setErrors] = useState(emptyErrors);
  const isValid = loginSchema.safeParse(payload).success;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name !== "userId" && name !== "password") return;
    console.log("name: ", name, "value: ", value);
    const field: LoginFieldName = name;
    setPayload((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]: loginFieldMessage(field, value),
    }));
  };

  return (
    <Form action={handleSubmit}>
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
      <Button type="submit" disabled={!isValid}>
        Login
      </Button>
    </Form>
  );
}
