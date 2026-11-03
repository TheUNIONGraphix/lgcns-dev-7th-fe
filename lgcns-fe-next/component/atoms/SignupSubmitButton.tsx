"use client";

import { useFormStatus } from "react-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

type SignupFormAction = (formData: FormData) => void | Promise<void>;

export default function SignupSubmitButton({
  label,
  pendingLabel,
  variant = "default",
  action,
  name,
  value,
  className,
}: {
  label: string;
  pendingLabel: string;
  variant?: "default" | "outline";
  action: SignupFormAction;
  name?: string;
  value?: string;
  className?: string;
}) {
  const status = useFormStatus();
  const pending = status.pending && status.action === action;

  return (
    <button
      type="submit"
      formAction={action}
      name={name}
      value={value}
      disabled={status.pending}
      aria-busy={pending}
      className={cn(buttonVariants({ variant }), className)}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
