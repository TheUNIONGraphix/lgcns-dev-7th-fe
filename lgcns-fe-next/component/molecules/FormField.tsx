'use client';
import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import ErrorMessage from "../atoms/ErrorMessage";

export default function FormField({
  id,
  name,
  type,
  placeholder,
  value,
  error,
  isClearable,
  onChange,
}: {
  id: string;
  name: string;
  type: "text" | "password";
  placeholder: string;
  value: string;
  error?: string;
  isClearable?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const errorId = `${id}-error`;
  const [isVisible, setIsVisible] = useState(false);
  const showClear = Boolean(isClearable && value);
  const showToggle = type === "password";
  const inputType = showToggle && isVisible ? "text" : type;

  const handleClear = () => {
    onChange({
      target: { name, value: "" },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div>
      <div className="relative">
        <Input
          id={id}
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={showClear && showToggle ? "pr-14" : showClear || showToggle ? "pr-8" : undefined}
          onChange={onChange}
        />
        {showToggle ? (
          <button
            type="button"
            aria-label={isVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
            aria-pressed={isVisible}
            className="absolute top-1/2 right-1.5 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setIsVisible((current) => !current)}
          >
            {isVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </button>
        ) : null}
        {showClear ? (
          <button
            type="button"
            aria-label={`${placeholder} 입력 지우기`}
            className={`absolute top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground ${showToggle ? "right-7" : "right-1.5"}`}
            onClick={handleClear}
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
      <ErrorMessage id={errorId} error={error} />
    </div>
  );
}
