import SignupSubmitButton from "../atoms/SignupSubmitButton";
import { backSignupStep } from "@/app/(auth)/signup/actions";

type SignupFormAction = (formData: FormData) => void | Promise<void>;

export default function SignupStepActions({
  backStep,
  skipAction,
  skipPendingLabel = "이동 중",
  submitFormId,
  submitAction,
  submitLabel,
  submitPendingLabel,
  encType,
}: {
  backStep?: 1 | 2 | 3;
  skipAction?: SignupFormAction;
  skipPendingLabel?: string;
  submitFormId: string;
  submitAction: SignupFormAction;
  submitLabel: string;
  submitPendingLabel: string;
  encType?: "multipart/form-data";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {backStep ? (
        <form action={backSignupStep} className="inline-flex">
          <input type="hidden" name="backStep" value={backStep} />
          <SignupSubmitButton label="이전" pendingLabel="이동 중" variant="outline" />
        </form>
      ) : null}
      {skipAction ? (
        <form action={skipAction} className="inline-flex">
          <SignupSubmitButton label="건너뛰기" pendingLabel={skipPendingLabel} variant="outline" />
        </form>
      ) : null}
      <form id={submitFormId} action={submitAction} noValidate encType={encType} className="inline-flex">
        <SignupSubmitButton label={submitLabel} pendingLabel={submitPendingLabel} />
      </form>
    </div>
  );
}
