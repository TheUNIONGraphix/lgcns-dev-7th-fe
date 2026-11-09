"use client";

import { createContext, useContext, useMemo, useState } from "react";

type SignupStep = 1 | 2 | 3 | 4;

type SignupErrors = {
  userId?: string;
  email?: string;
  password?: string;
  interests?: string;
  profileImageUrl?: string;
  form?: string;
};

type SignupDraft = {
  userId: string;
  email: string;
  password: string;
  interestsText: string;
};

type SignupFlowValue = {
  step: SignupStep;
  draft: SignupDraft;
  errors: SignupErrors;
  setStep: (step: SignupStep) => void;
  setDraft: React.Dispatch<React.SetStateAction<SignupDraft>>;
  setErrors: (errors: SignupErrors) => void;
};

const SignupFlowContext = createContext<SignupFlowValue | null>(null);

function emptyDraft(): SignupDraft {
  return { userId: "", email: "", password: "", interestsText: "" };
}

export function SignupFlow({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState<SignupStep>(1);
  const [draft, setDraft] = useState<SignupDraft>(emptyDraft);
  const [errors, setErrors] = useState<SignupErrors>({});
  const value = useMemo(
    () => ({ step, draft, errors, setStep, setDraft, setErrors }),
    [step, draft, errors],
  );

  return (
    <SignupFlowContext.Provider value={value}>
      {children}
    </SignupFlowContext.Provider>
  );
}

export function useSignupFlow() {
  const value = useContext(SignupFlowContext);
  if (!value) {
    throw new Error("SignupFlow 안에서만 사용할 수 있습니다.");
  }
  return value;
}
