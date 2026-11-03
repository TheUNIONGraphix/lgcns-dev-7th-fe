import { Suspense } from "react";
import SignupFallback from "@/components/loader/SignupFallback";
import SignUpFormSection from "@/component/templates/SignupFormSection";
import Link from "next/link";

export default async function SignupPage({searchParams}: {searchParams: Promise<{[key: string]: string | string[] | undefined}>}) {
    const searchParamsData = await searchParams;
    
    console.log("step: ", searchParamsData.step);

    const handleSignup = async (formData: FormData) => {
        "use server"
        console.log(formData);
    };

    const step = searchParamsData.step === undefined ? 1 : parseInt(searchParamsData.step as string);

  return (
    <Suspense fallback={<SignupFallback />}>
        {/* <div className="flex flex-col gap-2 px-4 py-8">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
        </div> */}
      <Link href={`/signup?step=${step + 1}`}><p className="text-blue-500 px-4 py-2 rounded-md bg-blue-500/10 red"> next </p></Link>
      <Link href={`/signup?step=${step - 1}`}><p className="text-blue-500 px-4 py-2 rounded-md bg-blue-500/10 red"> previous </p></Link>
      <SignUpFormSection step={step} handleSignup={handleSignup}/>
    </Suspense>
  );
}
