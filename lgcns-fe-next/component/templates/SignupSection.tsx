"use client";
import { useState } from "react";
import FormField from "../molecules/FormField";
import { Button } from "@/components/ui/button";
import SignupFields from "../organisms/SignupFields";

export default function SignupSection() {

    // const handleSignup = () => {
    //     console.log(userId, email);
    // };

    // const [userId, setUserId] = useState("");
    // const [email, setEmail] = useState("");
    // const [step, setStep] = useState(1);
    // const [errors, setErrors] = useState({
    //     userId: "",
    //     email: "",
    // });
    // // 대문자 불가, 첫글자 숫자불가, 4자리이상, 20자리 이하, 특수기호 불가
    // const regex = /^[a-z][a-z0-9]{3,19}$/;

    // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     if (!regex.test(event.target.value)) {
    //         setErrors((current) => ({ ...current, userId: "올바른 아이디를 입력해주세요. 대문자 불가, 첫글자 숫자불가, 4자리이상, 20자리 이하, 특수기호 불가" }));
    //     } else {
    //         setErrors((current) => ({ ...current, userId: "" }));
    //     }
    //     setUserId(event.target.value);
    // };

    // const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     if (!event.target.value.includes("@")) {
    //         setErrors((current) => ({ ...current, email: "올바른 이메일을 입력해주세요." }));
    //     } else {
    //         setErrors((current) => ({ ...current, email: "" }));
    //     }
    //     setEmail(event.target.value);
    // };

    // const handleNext = () => {
    //     if (errors.userId) {
    //         return;
    //     }
    //     setStep(step + 1);
    // };

    // const handlePrevious = () => {
    //     if (step === 1) {
    //         return;
    //     }
    //     setStep(step - 1);
    // };

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8 relative h-screen">
      <h2 id="signup-title" className="text-xl font-semibold">
        회원가입
      </h2>
      <SignupFields />
     
    </section>
  );
}
