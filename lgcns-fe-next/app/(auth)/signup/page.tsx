import { Suspense } from "react";
import SignupSection from "@/component/templates/SignupSection";
import { furthestSignupStep, readSignupDraft, readSignupErrors } from "./draft";

function SignupFallback() {
  return (
    <section className="relative mx-auto flex h-screen w-full max-w-md flex-col gap-4 px-4 py-8" aria-busy="true">
      <h2 className="text-xl font-semibold">회원가입</h2>
      <p className="text-sm text-muted-foreground">회원가입 단계를 불러오는 중입니다.</p>
    </section>
  );
}

async function SignupContent() {
  const draft = await readSignupDraft();
  const errors = await readSignupErrors();
  const maxStep = furthestSignupStep(draft);
  const step = draft.step > maxStep ? maxStep : draft.step;

  return <SignupSection step={step} draft={draft} errors={errors} />;
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupContent />
    </Suspense>
  );
}
