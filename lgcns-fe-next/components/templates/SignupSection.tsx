"use client";

import Link from "next/link";
import { Footer, Header, Section } from "@/components/ui/landmark";
import type { SignupFormState } from "@/actions/signupForm";
import SignupEmailForm from "../organisms/SignupEmailForm";
import SignupForm from "../organisms/SignupForm";
import SignupIdentityForm from "../organisms/SignupIdentityForm";
import SignupPasswordForm from "../organisms/SignupPasswordForm";
import SignupProfileForm from "../organisms/SignupProfileForm";

type SignupAction = (
  state: SignupFormState,
  formData: FormData,
) => Promise<SignupFormState>;

export default function SignupSection({ action }: { action: SignupAction }) {
  return (
    <Section className="flex min-h-dvh flex-col items-center bg-[#f3f4f6] px-4 py-10">
      <div className="my-auto flex w-full max-w-[484px] flex-col gap-8 rounded-[24px] border border-[#e5e7eb] bg-white px-8 pt-14 pb-10 shadow-[0px_12px_32px_-8px_rgba(0,0,0,0.08)] min-[480px]:px-12">
        <Header className="flex w-full flex-col items-center gap-2 text-center">
          <h1 className="!font-sans w-full text-[28px] leading-[normal] font-bold text-[#111827]">
            회원가입
          </h1>
          <p className="w-full text-[14px] leading-[normal] text-[#6b7280]">
            간단한 4단계로 계정을 만들어보세요
          </p>
        </Header>
        <SignupForm action={action}>
          {(view) =>
            view.step === 1 ? (
              <SignupIdentityForm
                userId={view.userId}
                errors={view.errors}
                seq={view.seq}
                isPending={view.isPending}
                pendingIntent={view.pendingIntent}
              />
            ) : view.step === 2 ? (
              <SignupPasswordForm
                password={view.password}
                passwordConfirm={view.passwordConfirm}
                errors={view.errors}
                seq={view.seq}
                isPending={view.isPending}
                pendingIntent={view.pendingIntent}
              />
            ) : view.step === 3 ? (
              <SignupEmailForm
                email={view.email}
                errors={view.errors}
                seq={view.seq}
                isPending={view.isPending}
                pendingIntent={view.pendingIntent}
              />
            ) : (
              <SignupProfileForm
                errors={view.errors}
                isPending={view.isPending}
                pendingIntent={view.pendingIntent}
              />
            )
          }
        </SignupForm>
        <Footer className="flex w-full flex-col gap-5">
          <div className="h-px w-full bg-[#e5e7eb]" />
          <p className="text-center text-[14px] leading-[normal] text-[#6b7280]">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-semibold text-[#2563eb]">
              로그인
            </Link>
          </p>
        </Footer>
      </div>
    </Section>
  );
}
