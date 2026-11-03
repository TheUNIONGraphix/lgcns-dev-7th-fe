import { Skeleton } from "@/components/ui/skeleton";

export default function SignupFallback() {
  return (
    <section className="relative mx-auto flex h-screen w-full max-w-md flex-col gap-2 px-4 py-8" aria-busy="true">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </section>
  );
}