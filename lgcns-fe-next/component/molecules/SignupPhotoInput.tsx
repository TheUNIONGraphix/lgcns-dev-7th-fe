"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ErrorMessage from "../atoms/ErrorMessage";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export default function SignupPhotoInput({ error }: { error?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState("");
  const [localError, setLocalError] = useState("");
  const [hideServerError, setHideServerError] = useState(false);
  const [serverError, setServerError] = useState(error);
  const [blocked, setBlocked] = useState<"" | "type" | "size">("");

  if (error !== serverError) {
    setServerError(error);
    setHideServerError(false);
  }

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const replacePreview = (next: string) => {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(next);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHideServerError(true);
    const file = event.target.files?.[0];
    if (!file) {
      replacePreview("");
      setBlocked("");
      setLocalError("");
      return;
    }
    if (!IMAGE_TYPES.includes(file.type)) {
      event.target.value = "";
      replacePreview("");
      setBlocked("type");
      setLocalError("PNG, JPEG, GIF, WEBP 이미지만 등록할 수 있습니다.");
      return;
    }
    if (file.size > 500 * 1024) {
      event.target.value = "";
      replacePreview("");
      setBlocked("size");
      setLocalError("프로필 사진은 500KB 이하로 등록해 주세요.");
      return;
    }
    setBlocked("");
    setLocalError("");
    replacePreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    if (inputRef.current) inputRef.current.value = "";
    replacePreview("");
    setBlocked("");
    setLocalError("");
    setHideServerError(true);
  };

  const message = hideServerError ? localError : error || localError;

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="profileImageBlocked" value={blocked} />
      <Input
        ref={inputRef}
        id="profileImage"
        name="profileImage"
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        aria-invalid={Boolean(message)}
        aria-describedby={message ? "profileImage-error" : undefined}
        onChange={handleChange}
      />
      {preview ? (
        <img src={preview} alt="선택한 프로필 사진 미리보기" className="size-24 rounded-full object-cover" />
      ) : null}
      {preview ? (
        <Button type="button" variant="ghost" onClick={clearPhoto}>
          사진 지우기
        </Button>
      ) : null}
      <ErrorMessage id="profileImage-error" error={message} />
    </div>
  );
}
