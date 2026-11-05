"use client";
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
  defaultValue = "",
  error,
  isClearable,
  required = true,
  autoComplete,
  form,
  inputClassName,
  showPasswordToggle = true,
  collapseEmptyError = false,
  errorClassName,
  onChange,
}: {
  id: string;
  name: string;
  type: "text" | "password" | "email";
  placeholder: string;
  value?: string;
  defaultValue?: string;
  error?: string;
  isClearable?: boolean;
  required?: boolean;
  autoComplete?: string;
  form?: string;
  inputClassName?: string;
  showPasswordToggle?: boolean;
  collapseEmptyError?: boolean;
  errorClassName?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const errorId = `${id}-error`;
  const [isVisible, setIsVisible] = useState(false);
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = isControlled ? value : uncontrolledValue;
  const showClear = Boolean(isClearable && currentValue);
  const showToggle = showPasswordToggle && type === "password";
  const inputType = showToggle && isVisible ? "text" : type;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolledValue(event.target.value);
    onChange?.(event);
  };

  const handleClear = () => {
    if (!isControlled) setUncontrolledValue("");
    onChange?.({
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
          form={form}
          placeholder={placeholder}
          value={currentValue}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={[
            inputClassName,
            showClear && showToggle
              ? "pr-14"
              : showClear || showToggle
                ? "pr-8"
                : undefined,
          ]
            .filter(Boolean)
            .join(" ")}
          onChange={handleChange}
        />
        {showToggle ? (
          <button
            type="button"
            aria-label={isVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
            aria-pressed={isVisible}
            className="absolute top-1/2 right-1.5 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setIsVisible((current) => !current)}
          >
            {isVisible ? (
              <EyeOff className="size-3.5" />
            ) : (
              <Eye className="size-3.5" />
            )}
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
      {collapseEmptyError && !error ? null : (
        <ErrorMessage id={errorId} error={error} className={errorClassName} />
      )}
    </div>
  );
}
