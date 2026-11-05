import { Skeleton } from "@/components/ui/skeleton";

export default function SignupFallback() {
  return (
    <section
      className="flex min-h-dvh flex-col items-center bg-[#f3f4f6] px-4 py-10"
      aria-busy="true"
    >
      <div className="my-auto flex w-full max-w-[484px] flex-col gap-8 rounded-[24px] border border-[#e5e7eb] bg-white px-8 pt-14 pb-10 min-[480px]:px-12">
        <Skeleton className="mx-auto h-8 w-32" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </section>
  );
}
