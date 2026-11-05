"use client";

import Link from "next/link";
import { useActionState, useOptimistic, useTransition } from "react";
import {
  initialSignupState,
  type SignupFormState,
  type SignupIntent,
  type SignupStep,
} from "@/actions/signupForm";
import SignupEmailForm from "../organisms/SignupEmailForm";
import SignupIdentityForm from "../organisms/SignupIdentityForm";
import SignupPasswordForm from "../organisms/SignupPasswordForm";
import SignupProfileForm from "../organisms/SignupProfileForm";
import SignupProgress from "../molecules/SignupProgress";

type SignupAction = (
  state: SignupFormState,
  formData: FormData,
) => Promise<SignupFormState>;

type OptimisticSignup = SignupFormState & { pendingIntent?: SignupIntent };

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function nextStep(step: SignupStep, intent: SignupIntent): SignupStep {
  if (intent === "back") return step > 1 ? ((step - 1) as SignupStep) : 1;
  if (intent === "next" && step < 4) return (step + 1) as SignupStep;
  return step;
}

export default function SignupSection({ action }: { action: SignupAction }) {
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

  return (
    <section className="flex min-h-dvh flex-col items-center bg-[#f3f4f6] px-4 py-10">
      <div className="my-auto flex w-full max-w-[484px] flex-col gap-8 rounded-[24px] border border-[#e5e7eb] bg-white px-8 pt-14 pb-10 shadow-[0px_12px_32px_-8px_rgba(0,0,0,0.08)] min-[480px]:px-12">
        <header className="flex w-full flex-col items-center gap-2 text-center">
          <h1 className="!font-sans w-full text-[28px] leading-[normal] font-bold text-[#111827]">
            회원가입
          </h1>
          <p className="w-full text-[14px] leading-[normal] text-[#6b7280]">
            간단한 4단계로 계정을 만들어보세요
          </p>
        </header>
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
          {view.step === 1 ? (
            <SignupIdentityForm
              key={view.step}
              userId={view.userId}
              errors={state.step === 1 ? state.errors : {}}
              isPending={isPending}
              pendingIntent={view.pendingIntent}
            />
          ) : null}
          {view.step === 2 ? (
            <SignupPasswordForm
              key={view.step}
              password={view.password}
              passwordConfirm={view.passwordConfirm}
              errors={state.step === 2 ? state.errors : {}}
              isPending={isPending}
              pendingIntent={view.pendingIntent}
            />
          ) : null}
          {view.step === 3 ? (
            <SignupEmailForm
              key={view.step}
              email={view.email}
              errors={state.step === 3 ? state.errors : {}}
              isPending={isPending}
              pendingIntent={view.pendingIntent}
            />
          ) : null}
          {view.step === 4 ? (
            <SignupProfileForm
              key={view.step}
              errors={state.step === 4 ? state.errors : {}}
              isPending={isPending}
              pendingIntent={view.pendingIntent}
            />
          ) : null}
        </form>
        <footer className="flex w-full flex-col gap-5">
          <div className="h-px w-full bg-[#e5e7eb]" />
          <p className="text-center text-[14px] leading-[normal] text-[#6b7280]">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-semibold text-[#2563eb]">
              로그인
            </Link>
          </p>
        </footer>
      </div>
    </section>
  );
}
