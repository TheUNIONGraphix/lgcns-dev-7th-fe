import type { ReactNode } from "react";
import SignupSubmitButton from "../atoms/SignupSubmitButton";
import { backSignupStep } from "@/actions/userActions";

type SignupFormAction = (formData: FormData) => void | Promise<void>;

export default function SignupStepActions({
  backStep,
  skipAction,
  skipPendingLabel = "이동 중",
  submitAction,
  submitLabel,
  submitPendingLabel,
  encType,
  children,
}: {
  backStep?: 1 | 2 | 3;
  skipAction?: SignupFormAction;
  skipPendingLabel?: string;
  submitAction: SignupFormAction;
  submitLabel: string;
  submitPendingLabel: string;
  encType?: "multipart/form-data";
  children: ReactNode;
}) {
  return (
    <form action={submitAction} noValidate encType={encType} className="flex flex-col gap-4">
      {children}
      <div className="flex flex-wrap gap-2">
        <SignupSubmitButton
          action={submitAction}
          label={submitLabel}
          pendingLabel={submitPendingLabel}
          className="order-3"
        />
        {backStep ? (
          <SignupSubmitButton
            action={backSignupStep}
            name="backStep"
            value={String(backStep)}
            label="이전"
            pendingLabel="이동 중"
            variant="outline"
            className="order-1"
          />
        ) : null}
        {skipAction ? (
          <SignupSubmitButton
            action={skipAction}
            label="건너뛰기"
            pendingLabel={skipPendingLabel}
            variant="outline"
            className="order-2"
          />
        ) : null}
      </div>
    </form>
  );
}
