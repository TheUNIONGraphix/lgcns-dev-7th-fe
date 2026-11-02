# 오늘 생성된 파일의 기능

- 날짜: 2026-11-02
- 대상: Next.js 16.4.3, React 19.3.0, `lgcns-fe-next`
- 기준은 현재 소스다. 아래 파일은 오늘 커밋에서 추가된 뒤 아직 저장소에 있는 것이다. 지워진 `component/templates/LoginForm.tsx`와 `component/atoms/Button.tsx`는 없다.

`FormField`가 화면의 입력 하나를 만든다. 그 위 유기체 `LoginForm`이 값을 들고, 페이지의 서버 함수가 제출을 받는다.

## 1. `component/molecules/FormField.tsx`

선언은 `'use client'`와 `function FormField`다. 클라이언트 컴포넌트다. `LoginForm`만 이 파일을 import 한다. 브라우저 모듈로 로드되고, `onClick`과 `onChange`는 브라우저에서 실행된다. `<script async>`나 `defer` 태그는 아니다.

받는 값:

| 인자 | 하는 일 |
| --- | --- |
| `id` | 입력 `id`. 오류 문단 id는 `${id}-error` |
| `name` | 폼 전송 때 `FormData` 키. 지우기 때도 이 이름을 `onChange`에 넘긴다 |
| `type` | `"text"` 또는 `"password"`. 비밀번호일 때만 보기 버튼을 그린다 |
| `placeholder` | 입력 안내 문구. 지우기 버튼 이름에 붙인다 |
| `value` | 부모가 가진 현재 문자열. 입력을 통제한다 |
| `error` | 없으면 오류 문단은 투명하다. 있으면 `aria-invalid`와 `aria-describedby`를 켠다 |
| `isClearable` | 참이고 `value`가 비어 있지 않을 때만 X 버튼을 그린다 |
| `onChange` | 글자가 바뀌거나 X를 눌렀을 때 부모 `handleChange`로 올라간다 |

함수와 값:

- `errorId`는 `` `${id}-error` ``다. 입력의 `aria-describedby`와 `ErrorMessage`의 `id`가 같은 문자열을 쓴다.
- `isVisible`은 `useState(false)`다. 비밀번호를 글자로 보여줄지 여부다. 이 상태는 이 필드 안에만 있고 부모로 올라가지 않는다. [React useState](https://react.dev/reference/react/useState).
- `showClear`는 `Boolean(isClearable && value)`다. 빈 문자열은 거짓이라 X가 없다.
- `showToggle`은 `type === "password"`다.
- `inputType`은 비밀번호이면서 `isVisible`이 참이면 `"text"`, 아니면 받은 `type`이다. `type="password"`는 값을 가리고 `type="text"`는 보여 준다. [MDN input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input).
- `handleClear`는 브라우저 `ChangeEvent`를 만들지 않는다. `{ target: { name, value: "" } }`만 만들어 `onChange`에 넘긴다. 부모는 `event.target.name`과 `event.target.value`만 읽는다.

그리는 것:

1. 바깥 `div`.
2. `className="relative"`인 `div`. 버튼을 입력 위에 겹치기 위한 기준이다.
3. `Input`. `value`, `name`, `required`, `onChange`를 넘긴다. `className`은 버튼이 둘이면 `"pr-14"`, 하나면 `"pr-8"`, 없으면 `undefined`다.
4. `showToggle`일 때 `type="button"` 버튼. `aria-pressed`는 `isVisible`이다. 보이면 `EyeOff`와 `"비밀번호 숨기기"`, 가려져 있으면 `Eye`와 `"비밀번호 보기"`다. 클릭은 `setIsVisible`로 참과 거짓을 뒤집는다. [MDN aria-pressed](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-pressed).
5. `showClear`일 때 `type="button"` 버튼. `X` 아이콘이다. 비밀번호 보기 버튼이 있으면 `right-7`, 없으면 `right-1.5`다.
6. `ErrorMessage`.

폼 안의 `<button>`은 `type`을 빼면 제출 버튼이 된다. 두 버튼은 `type="button"`이라 폼을 보내지 않는다. [MDN button](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button).

이 파일은 `FormData`를 만들지 않고 서버 함수를 부르지 않는다.

## 2. `component/atoms/ErrorMessage.tsx`

선언은 `function ErrorMessage`다. 파일에 `"use client"`는 없다. `FormField`가 import 하므로 클라이언트 그래프에 실려 브라우저에서 함께 실행된다.

인자 `id`는 문단 id다. `error`는 없을 수 있는 문자열이다.

`if (!error) return null`은 주석이다. 그래서 오류가 없어도 함수는 항상 `<p>`를 반환한다. `role="alert"`다. `className`은 `"text-red-500 py-4"`다. `style.opacity`는 `error`가 있으면 `1`, 없으면 `0`이다. `style.transition`은 `"opacity 0.3s ease-in-out"`이다. 글자가 없어도 `py-4` 높이는 남는다. 자식은 `{error}` 한 개다.

## 3. `component/organisms/LoginForm.tsx`

선언은 `"use client"`와 `function LoginForm`이다. `LoginSection`이 import 한다.

인자 `handleSubmit`은 `(formData: FormData) => void`다. 페이지의 서버 함수가 이 인자로 들어온다. 이 파일 안에서 `"use server"`를 적지 않는다.

값:

- `LoginFieldName`은 `UserPayloadType`의 키라 `"userId" | "password"`다.
- `payload`의 처음 값은 `loginInitial.ts`의 `initialValues`다. 둘 다 `""`다.
- `errors`의 처음 값은 `loginError.ts`의 `emptyErrors`다. 둘 다 `""`다.
- `isValid`는 `loginSchema.safeParse(payload).success`다. 렌더마다 다시 계산하고, 따로 상태로 저장하지 않는다.

`handleChange`는 `event.target`에서 `name`과 `value`를 읽는다. `name`이 두 필드가 아니면 반환한다. 맞으면 브라우저 콘솔에 `name`과 `value`를 찍고, `payload`의 그 키만 바꾸고, `loginFieldMessage(field, value)` 결과로 `errors`의 그 키만 바꾼다. 다른 필드의 오류는 그대로 둔다.

반환은 `next/form`의 `Form`이다. `action={handleSubmit}`이다. 이 컴포넌트는 `action`이 함수이면 그 서버 함수를 실행한다. [Next.js Form](https://nextjs.org/docs/app/api-reference/components/form). 자식은 아이디 `FormField`(`type="text"`, `isClearable={true}`), 비밀번호 `FormField`(`type="password"`, `isClearable={true}`), 제출 `Button`이다. 제출 버튼은 `type="submit"`이고 `disabled={!isValid}`다.

## 4. `component/templates/LoginSection.tsx`

선언은 `function LoginSection`이다. `"use client"`가 없다. 서버 컴포넌트다. `app/(auth)/login/page.tsx`가 import 한다. 함수 본문은 브라우저 번들로 내려가지 않는다.

인자 `handleSubmit`을 그대로 `LoginForm`에 넘긴다. 반환은 `<section>` 하나다. 상태, Zod, 입력은 이 파일에 없다.

## 5. `schema/loginSchema.ts`

`"use client"`가 없다. `LoginForm`이 import 하므로 클라이언트 그래프에서 실행된다. 서버 함수 `handleSubmit`은 이 파일을 부르지 않는다.

- `loginSchema`는 `z.object`다. `userId`와 `password`는 각각 `z.string().min(1, 메시지)`다. 길이가 1보다 작으면 그 문자열이 이슈 메시지가 된다. [Zod](https://zod.dev).
- `LoginFieldName`은 `keyof UserPayloadType`이다.
- `loginFieldMessage(field, value)`는 `loginSchema.shape[field].safeParse(value)`를 한다. 성공하면 `""`를 반환한다. 실패하면 `result.error.issues[0]?.message`를 반환하고, 그것도 없으면 `""`다. 객체 전체가 아니라 그 필드 스키마만 검사하므로, 한쪽만 비어도 다른 쪽 메시지가 이 함수 결과로 섞이지 않는다.
- `loginFieldMessage`는 이름 있는 내보내기다. `loginSchema`는 기본 내보내기다.

## 6. `types/request/RequestType.ts`

`interface UserPayloadType`은 `userId: string`, `password: string`이다. `export type { UserPayloadType }`로 이름 있게 내보낸다. 런타임 값을 만들거나 검사하지 않는다. `loginSchema`, `loginInitial`, `loginError`, `LoginForm`이 이 모양을 쓴다.

## 7. `types/initial/loginInitial.ts`

`initialValues`는 `UserPayloadType`이고 두 필드가 `""`다. `export default initialValues`다. `LoginForm`의 `useState(initialValues)` 처음 값이다. 함수는 없다.

## 8. `types/error/loginError.ts`

`LoginFieldName`은 `keyof UserPayloadType`이다. `emptyErrors`는 `Record<LoginFieldName, string>`이고 두 값이 `""`다. `export const emptyErrors`로 이름 있게 내보낸다. 기본 내보내기는 없다. `LoginForm`의 오류 상태 처음 값이다. 함수는 없다.

## 9. `app/(auth)/client-login/page.tsx`

선언은 `'use client'`와 `function ClientLogin`이다. 라우트 그룹 `(auth)`는 URL에 없다. 주소는 `/client-login`이다. 페이지 전체가 클라이언트 컴포넌트라 브라우저 모듈로 로드된다.

- `userId`, `password`는 각각 `useState("")`다.
- `handleUserIdChange`는 `e.target.value`를 브라우저 콘솔에 찍고 `setUserId`를 호출한다.
- `handlePasswordChange`는 같은 일을 비밀번호 상태에 한다.
- `handleSubmit`은 `e.preventDefault()`로 폼의 기본 전송을 막는다. [MDN preventDefault](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault). 그다음 상태 두 개를 브라우저 콘솔에 찍는다. `FormData`를 만들지 않고 서버 함수를 부르지 않는다.

반환은 HTML `<form onSubmit={handleSubmit}>`이다. 입력 둘은 `value`와 `onChange`만 있고 `name`은 없다. `name`이 없으므로, 설령 기본 제출이 일어나도 폼 데이터 셋에 들어가지 않는다. [MDN FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData). 제출 버튼에 `disabled` 조건은 없다. Zod, X 버튼, 보기 버튼은 없다.

## 10. `components/ui/input.tsx`

선언은 `function Input`이다. `"use client"`는 이 파일에 없다. `@base-ui/react/input`의 `Input.js` 첫 줄이 `'use client'`라 이 입력을 그리는 쪽은 클라이언트 경계가 된다. `export { Input }`이다. 기본 내보내기는 없다.

`className`과 `type`을 빼고 나머지 props를 `InputPrimitive`에 넘긴다. `data-slot="input"`을 붙인다. `className`은 `cn`으로 기본 클래스와 호출자가 준 `className`을 합친다. `FormField`가 넘기는 `id`, `name`, `value`, `required`, `aria-*`, `onChange`는 `...props`로 들어간다. 이 파일은 값을 저장하지 않는다.

## 11. `component/atoms/CustomButton.tsx`

선언은 `function CustomButton`이다. `"use client"`는 이 파일에 없다. `@base-ui/react/button`이 클라이언트 경계다. `export { CustomButton, buttonVariants }`다. 기본 내보내기는 없다.

`buttonVariants`는 `cva`로 만든 클래스 조합이다. `variant`에는 `default`, `lgcns`, `outline`, `secondary`, `ghost`, `destructive`, `link`가 있다. `size`에는 `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`가 있다. 기본 variant와 size는 둘 다 `"default"`다.

`CustomButton`은 `className`, `variant = "default"`, `size = "default"`, 나머지 props를 받는다. `ButtonPrimitive`에 `data-slot="button"`과 `cn(buttonVariants({ variant, size, className }))`을 넘긴다. 로그인 폼은 이 파일을 쓰지 않는다. 로그인 제출 버튼은 `components/ui/button.tsx`의 `Button`이다.

## 12. 호출 순서

`/login`에서 글자를 입력하면 `FormField`의 `Input`이 `onChange`를 부르고, `LoginForm.handleChange`가 `payload`와 `errors`를 바꾼다. `loginFieldMessage`는 그 필드만 검사한다. X는 같은 `handleChange`에 빈 문자열을 넘긴다. 보기 버튼은 `FormField`의 `isVisible`만 바꾼다. 제출은 `name`이 있는 입력으로 `FormData`를 만들고, 페이지의 `handleSubmit`이 서버에서 `formData.get`을 한다. `/client-login`은 이 연쇄에 들어가지 않는다.
