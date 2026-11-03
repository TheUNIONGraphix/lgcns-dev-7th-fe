import { Suspense } from "react";
import { redirect } from "next/navigation";
import SignupSection from "@/component/templates/SignupSection";
import SignupFallback from "@/components/loader/SignupFallback";
import { furthestSignupStep, readSignupDraft, readSignupErrors } from "@/actions/draft";

async function SignupContent({
  stepParam,
}: {
  stepParam: string | string[] | undefined;
}) {
  const draft = await readSignupDraft();
  const errors = await readSignupErrors();
  const maxStep = furthestSignupStep(draft);
  const raw = Array.isArray(stepParam) ? stepParam[0] : stepParam;
  const parsed = raw === undefined ? draft.step : Number(raw);
  const requested = parsed === 2 || parsed === 3 || parsed === 4 ? parsed : 1;
  const step = requested > maxStep ? maxStep : requested;

  if (raw !== String(step)) {
    redirect(`/signup?step=${step}`);
  }

  return <SignupSection step={step} draft={draft} errors={errors} />;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParamsData = await searchParams;

  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupContent stepParam={searchParamsData.step} />
    </Suspense>
  );
}
