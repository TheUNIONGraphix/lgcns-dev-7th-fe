"use client";

import { useRouter } from "next/navigation";
import PostEditor from "@/components/organisms/PostEditor";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function PostWriteSheet({
  title,
  description,
  closeHref,
  action,
  submitLabel,
  initialHtml,
  postId,
}: {
  title: string;
  description: string;
  closeHref: string;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  initialHtml?: string;
  postId?: string;
}) {
  const router = useRouter();

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) router.push(closeHref);
      }}
    >
      <SheetContent
        side="right"
        className="w-full gap-8 overflow-y-auto bg-white px-8 pt-14 pb-10 data-[side=right]:w-full data-[side=right]:sm:max-w-3xl"
      >
        <SheetHeader className="items-center gap-2 p-0 text-center">
          <SheetTitle className="!font-sans w-full text-[28px] leading-[normal] font-bold text-[#111827]">
            {title}
          </SheetTitle>
          <SheetDescription className="w-full text-[14px] leading-[normal] text-[#6b7280]">
            {description}
          </SheetDescription>
        </SheetHeader>
        <PostEditor
          action={action}
          submitLabel={submitLabel}
          initialHtml={initialHtml}
          postId={postId}
        />
      </SheetContent>
    </Sheet>
  );
}
