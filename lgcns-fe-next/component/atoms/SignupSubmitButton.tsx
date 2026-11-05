"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

type SignupIntent = "next" | "back" | "skip";

export default function SignupSubmitButton({
  intent,
  label,
  pendingLabel,
  variant = "default",
  className,
  icon,
  isPending = false,
  pendingIntent,
}: {
  intent: SignupIntent;
  label: string;
  pendingLabel: string;
  variant?: "default" | "outline";
  className?: string;
  icon?: ReactNode;
  isPending?: boolean;
  pendingIntent?: SignupIntent;
}) {
  const status = useFormStatus();
  const submitted = status.data?.get("intent");
  const pending =
    (status.pending && submitted === intent) ||
    (isPending && pendingIntent === intent);

  return (
    <button
      type="submit"
      name="intent"
      value={intent}
      disabled={status.pending || isPending}
      aria-busy={pending}
      className={cn(buttonVariants({ variant }), className)}
    >
      {pending ? pendingLabel : label}
      {pending ? null : icon}
    </button>
  );
}
