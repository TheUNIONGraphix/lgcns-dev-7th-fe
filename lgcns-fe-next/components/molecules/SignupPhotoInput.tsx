"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_PROFILE_IMAGE_BYTES } from "@/schema/signupSchema";

const IMAGE_TYPES = ["image/png", "image/jpeg"];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function SignupPhotoInput({ error }: { error?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
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

  const clearPhoto = () => {
    if (inputRef.current) inputRef.current.value = "";
    replacePreview("");
    setFileName("");
    setFileSize(0);
    setBlocked("");
    setLocalError("");
    setHideServerError(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHideServerError(true);
    const file = event.target.files?.[0];
    if (!file) {
      clearPhoto();
      return;
    }
    if (!IMAGE_TYPES.includes(file.type)) {
      event.target.value = "";
      replacePreview("");
      setFileName("");
      setFileSize(0);
      setBlocked("type");
      setLocalError("JPG, PNG 이미지만 등록할 수 있습니다.");
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      event.target.value = "";
      replacePreview("");
      setFileName("");
      setFileSize(0);
      setBlocked("size");
      setLocalError("프로필 사진은 5MB 이하로 등록해 주세요.");
      return;
    }
    setBlocked("");
    setLocalError("");
    setFileName(file.name);
    setFileSize(file.size);
    replacePreview(URL.createObjectURL(file));
  };

  const message = hideServerError ? localError : error || localError;

  return (
    <div className="flex w-full flex-col items-center gap-[14px]">
      <input type="hidden" name="profileImageBlocked" value={blocked} />
      <input
        ref={inputRef}
        id="profileImage"
        name="profileImage"
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        aria-invalid={Boolean(message)}
        aria-describedby={message ? "profileImage-error" : undefined}
        onChange={handleChange}
      />
      <div className="size-[104px] overflow-hidden rounded-full border border-[#e5e7eb] bg-[#f9fafb]">
        {preview ? (
          <img
            src={preview}
            alt="선택한 프로필 사진 미리보기"
            width={104}
            height={104}
            className="h-[104px] w-[104px] max-w-none object-cover"
          />
        ) : null}
      </div>
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#d1d5db] bg-white px-4 text-[13px] leading-[normal] font-semibold text-[#374151]"
        onClick={() => inputRef.current?.click()}
      >
        <img
          src="/signup/upload.svg"
          alt=""
          width={16}
          height={16}
          className="h-4 w-4 max-w-none"
        />
        이미지 업로드 / 변경
      </button>
      {fileName ? (
        <p className="flex items-center gap-3 text-[12px] leading-[normal] text-[#6b7280]">
          <span>
            {fileName} · {formatSize(fileSize)}
          </span>
          <button type="button" className="underline" onClick={clearPhoto}>
            삭제
          </button>
        </p>
      ) : null}
      <p className="text-center text-[12px] leading-[normal] text-[#9ca3af]">
        JPG, PNG · 최대 5MB
      </p>
      {message ? (
        <p
          id="profileImage-error"
          className="text-center text-[12px] text-red-500"
          role="alert"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
