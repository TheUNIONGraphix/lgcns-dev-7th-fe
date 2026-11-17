"use client";

import { useActionState, useOptimistic, useTransition, type ReactNode } from "react";
import {
  initialSignupState,
  type SignupErrors,
  type SignupFormState,
  type SignupIntent,
  type SignupStep,
} from "@/actions/signupForm";
import SignupProgress from "../molecules/SignupProgress";

type SignupAction = (
  state: SignupFormState,
  formData: FormData,
) => Promise<SignupFormState>;

type OptimisticSignup = SignupFormState & { pendingIntent?: SignupIntent };

export type SignupStepView = {
  step: SignupStep;
  userId: string;
  password: string;
  passwordConfirm: string;
  email: string;
  errors: SignupErrors;
  seq: number;
  isPending: boolean;
  pendingIntent?: SignupIntent;
};

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function nextStep(step: SignupStep, intent: SignupIntent): SignupStep {
  if (intent === "back") return step > 1 ? ((step - 1) as SignupStep) : 1;
  if (intent === "next" && step < 4) return (step + 1) as SignupStep;
  return step;
}

export default function SignupForm({
  action,
  children,
}: {
  action: SignupAction;
  children: (view: SignupStepView) => ReactNode;
}) {
  const [state, formAction, actionPending] = useActionState(
    action,
    initialSignupState,
  );
  const [optimistic, addOptimistic] = useOptimistic<
    OptimisticSignup,
    Partial<OptimisticSignup>
  >(state, (current, patch) => ({
    ...current,
    ...patch,
    errors: {},
  }));
  const [transitionPending, startTransition] = useTransition();
  const isPending = actionPending || transitionPending;

  const submit = (formData: FormData) => {
    const intentValue = readText(formData, "intent");
    const intent: SignupIntent =
      intentValue === "back" || intentValue === "skip" ? intentValue : "next";
    const raw = Number(readText(formData, "step"));
    const step: SignupStep = raw === 2 || raw === 3 || raw === 4 ? raw : 1;
    startTransition(() => {
      addOptimistic({
        step: nextStep(step, intent),
        pendingIntent: intent,
        userId: readText(formData, "userId"),
        password: readText(formData, "password"),
        passwordConfirm: readText(formData, "passwordConfirm"),
        email: readText(formData, "email"),
      });
      formAction(formData);
    });
  };

  const view = optimistic;
  const stepView: SignupStepView = {
    step: view.step,
    userId: view.userId,
    password: view.password,
    passwordConfirm: view.passwordConfirm,
    email: view.email,
    errors: state.step === view.step ? state.errors : {},
    seq: state.seq,
    isPending,
    pendingIntent: view.pendingIntent,
  };

  return (
    <>
      <SignupProgress step={view.step} />
      <form
        action={submit}
        noValidate
        aria-busy={isPending}
        className="flex w-full flex-col"
      >
        <input type="hidden" name="step" value={String(view.step)} />
        {view.step === 1 ? null : (
          <input type="hidden" name="userId" value={view.userId} />
        )}
        {view.step === 2 ? null : (
          <>
            <input type="hidden" name="password" value={view.password} />
            <input
              type="hidden"
              name="passwordConfirm"
              value={view.passwordConfirm}
            />
          </>
        )}
        {view.step === 3 ? null : (
          <input type="hidden" name="email" value={view.email} />
        )}
        {children(stepView)}
      </form>
    </>
  );
}
