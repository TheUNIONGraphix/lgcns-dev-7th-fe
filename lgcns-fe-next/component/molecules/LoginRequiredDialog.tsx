"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LoginRequiredDialog({
  open,
  onOpenChange,
  onLogin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>로그인이 필요해요</DialogTitle>
          <DialogDescription>
            좋아요는 로그인 후 이용할 수 있어요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button type="button" onClick={onLogin}>
            로그인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
