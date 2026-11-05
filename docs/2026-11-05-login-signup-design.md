# 2026-11-05 로그인·회원가입 화면과 설정

- 날짜: 2026-11-05
- 앱: `lgcns-fe-next`
- 패키지: `next` 16.4.3, `react` 19.3.0, `tailwindcss` ^4 (`lgcns-fe-next/package.json`)
- 기준: 이 문서의 “현재 코드”는 지금 디스크의 파일이다. 저장소 안에 Figma URL이나 MCP 호출은 없다. 화면에 남은 클래스, `public` SVG, `next.config.ts`, `schema/signupSchema.ts`만 적는다.

로그인과 회원가입은 가로 최대 484px 흰 카드다. 배경은 `#f3f4f6`, 테두리는 `#e5e7eb`, 모서리는 24px, 강조색은 `#2563eb`다. 가입은 아이디, 비밀번호, 이메일, 프로필 네 칸이다. 관심사 폼 파일은 없고, `SignupSection`도 그 단계를 그리지 않는다.

## 1. 파일이 언제 실행되는가

소스 페이지에는 로그인 카드를 부르는 `<script>`가 없다. Next가 모듈을 묶는다.

| 파일 | 선언 | 실행 시점 | HTML `<script>`와의 차이 |
| --- | --- | --- | --- |
| `lgcns-fe-next/app/(auth)/login/page.tsx` | `export default function Login()`. `"use client"` 없음 | 서버가 `/login` HTML을 만들 때 실행된다. 자식 `LoginSection`은 `<Suspense fallback={null}>` 안이다 | `async`, `defer`, `type="module"`로 이 파일을 붙이지 않는다 |
| `lgcns-fe-next/component/templates/LoginSection.tsx` | 첫 줄 `"use client"`. `export default function LoginSection()` | 서버가 첫 HTML을 만들고, 브라우저가 hydrate할 때 다시 실행된다. `useSearchParams()`는 그 클라이언트 렌더에서 돈다 | `"use client"`는 `<script async>`도 `<script defer>`도 아니다 |
| `lgcns-fe-next/app/(auth)/signup/page.tsx` | `async function SignupContent`와 `export default function SignupPage` | `searchParams`는 `<Suspense>` 안의 `SignupContent`에서 `await` 한다. 그 다음 `SignupSection`을 반환한다 | 페이지 함수 자체는 브라우저 모듈이 아니다 |
| `lgcns-fe-next/component/templates/SignupSection.tsx` | `export default function SignupSection`. `"use client"` 없음 | 서버 컴포넌트다. `step`이 1부터 4인 폼만 한 번에 하나 렌더한다 | 클릭 핸들러가 없다. 자식 폼의 `action`이 서버 함수다 |
| `lgcns-fe-next/app/layout.tsx` | `const geistSans = Geist(...)` 다음 `export default function RootLayout` | 루트 레이아웃이 HTML 껍데기를 만들 때 `next/font`가 글꼴 CSS 변수를 만든다 | 소스에 `<link>`로 Geist를 적지 않는다. `next/font`가 레이아웃 클래스로 붙인다 |
| `lgcns-fe-next/app/globals.css` | `@import "tailwindcss"`와 그 아래 `h1 { font-family: var(--font-black-han-sans); }` | Tailwind가 이 파일을 처리할 때 합쳐진다. `h1` 규칙은 레이어 밖이다 | 브라우저 스크립트가 아니다 |
| `lgcns-fe-next/next.config.ts` | `const nextConfig` 다음 `export default nextConfig` | `next dev` / `next build`가 설정으로 읽는다. 요청마다 다시 평가되는 페이지 함수가 아니다 | HTML에 없다 |
| `lgcns-fe-next/public/signup/*.svg` | SVG 파일. JS export 없음 | `<img src="/signup/...">`가 문서에 있을 때 브라우저가 그 URL을 따로 요청한다 | `<script>`가 아니다. `defer`로 미루지 않는다 |

HTML에서 `async`는 스크립트를 받는 즉시 실행하고 순서를 보장하지 않는다. `defer`는 문서를 파싱한 뒤 `DOMContentLoaded` 전에 순서대로 실행한다. `type="module"`은 기본적으로 지연되는 ES 모듈이다. 이 화면의 카드는 그 속성으로 붙지 않는다.

`app/(auth)/layout.tsx`는 `export default function AuthLayout`이고, 자식만 `flex min-h-full flex-1 flex-col`로 감싼다. 제목 “AuthLayout”은 없다. `app/(auth)/signup/layout.tsx`는 `return children`만 한다. 진행 막대는 이 레이아웃이 아니라 `SignupSection` 안의 `SignupProgress`다.

참고: [HTML script 요소](https://html.spec.whatwg.org/multipage/scripting.html#the-script-element), [MDN script](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script), [Next.js use client](https://nextjs.org/docs/app/api-reference/directives/use-client), [next/font](https://nextjs.org/docs/app/getting-started/fonts), [public 폴더](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder).

## 2. 카드와 글꼴

두 카드의 바깥 섹션은 `min-h-dvh`, `bg-[#f3f4f6]`, `px-4 py-10`이다. `min-h-dvh`는 `min-height: 100dvh`다. 로그인 섹션은 `items-center justify-center`로 카드를 가운데 둔다. 가입 섹션은 `flex-col items-center`이고, 카드에 `my-auto`가 있다.

카드 폭은 `w-full max-w-[484px]`다. 좌우 패딩은 기본 `px-8`이고, `min-[480px]:px-12`부터 48px이다. 이 variant는 최소 너비 480px 미디어 쿼리다.

로그인 제목과 가입 제목은 `h1`에 `!font-sans`를 둔다. Tailwind의 `!`는 그 유틸리티를 `!important`로 만든다. `app/globals.css`의 `h1`은 레이어 없는 규칙으로 `font-family: var(--font-black-han-sans)`다. 레이어 없는 선언은 `@layer` 안 유틸리티보다 우선한다. `!font-sans`가 그 규칙을 이긴다. `@theme inline`에서 `--font-sans`는 `var(--font-geist-sans)`다. 루트 `html`의 `className`에는 `geistSans.variable`과 `blackHanSans.variable`이 있다. `Gothic_A1`을 부르는 `const gothicA1`은 `app/layout.tsx`에 있지만, 그 `className` 문자열에는 `gothicA1.variable`이 없다.

로그인 본문은 `LoginForm`이다. 아이디·비밀번호 칸 높이는 `h-[52px]`, 모서리 `rounded-[10px]`, 제출 버튼은 `h-14`, `rounded-[12px]`, `bg-[#2563eb]`다. 비밀번호 칸은 `FormField`의 `showPasswordToggle`이다. 보기 상태는 `lucide-react`의 `Eye` / `EyeOff`다. 구글 버튼은 `Button` `variant="outline"`에 흰 배경, 카카오 버튼은 `bg-[#fee500]`다. 두 버튼 모두 아이콘 `<img>`가 없다.

`public/login/google-circle-x.svg`와 `public/login/kakao-circle-x.svg`는 디스크에 있다. `src`가 이 경로를 가리키는 컴포넌트는 없다. 가입 아이콘만 `<img src="/signup/...">`로 연결된다. 쓰는 파일은 `arrow-right.svg`, `check-13.svg`, `check-16.svg`, `check-18.svg`, `eye-off.svg`, `mail.svg`, `upload.svg`다. `alt=""`라서 접근 이름은 비어 있고, 장식이다. `next/image`가 아니다. `next.config.ts`의 `images.remotePatterns`는 이 로컬 SVG와 무관하다.

참고: [Tailwind important 수정자](https://tailwindcss.com/docs/styling-with-utility-classes#using-the-important-modifier), [MDN !important](https://developer.mozilla.org/en-US/docs/Web/CSS/important), [MDN @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer), [MDN dvh](https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths).

## 3. 가입 네 단계

`SignupSection`은 `step === 1`부터 `4`까지 각각 `SignupIdentityForm`, `SignupPasswordForm`, `SignupEmailForm`, `SignupProfileForm`만 마운트한다. 진행 표시 `SignupProgress`의 라벨은 “아이디”, “비밀번호”, “이메일”, “프로필”이다.

각 폼은 `SignupStepActions`의 `<form action={submitAction}>`이다. `action`에 넘긴 함수는 `actions/userActions.ts`의 서버 함수다. 아이디는 `submitSignupIdentity`, 비밀번호는 `submitSignupPassword`, 이메일은 `submitSignupEmail`, 프로필은 `submitSignupProfile`이다. 이전 버튼은 `backSignupStep`이다. 프로필만 `encType="multipart/form-data"`이고, `skipSignupProfile`로 사진 없이 끝낼 수 있다.

`SignupStepActions`의 본문 영역은 `min-h-[357px]`다. 다음 버튼은 `h-14 flex-1 rounded-[12px] bg-[#2563eb]`, 이전 버튼은 `h-14 w-[104px]`다. 1단계의 이전 버튼은 `type="button"`이고 `disabled`다. 서버 함수가 아니다.

`actions/userActions.ts`에는 `submitSignupInterests`와 `skipSignupInterests`가 아직 `export` 되어 있다. 현재 화면 트리는 이 함수를 import하지 않는다.

대기 중 자리는 `components/loader/SignupFallback.tsx`다. 카드와 같은 `max-w-[484px]`, `bg-[#f3f4f6]` 안에 `Skeleton` 네 개다. `aria-busy="true"`다. 로그인 페이지의 Suspense `fallback`은 `null`이다.

참고: [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations), [MDN form enctype](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form#enctype), [MDN aria-busy](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy).

## 4. 바뀐 설정

`next.config.ts`의 `experimental.serverActions.bodySizeLimit`은 `"6mb"`다. 기본 본문 한도는 1MB다. 프로필 폼은 파일 필드를 서버 액션 POST로 보낸다. `schema/signupSchema.ts`의 `MAX_PROFILE_IMAGE_BYTES`는 `5 * 1024 * 1024`다. `SignupPhotoInput`과 `profileImageFromForm`이 이 바이트 수를 넘으면 “프로필 사진은 5MB 이하로 등록해 주세요.”를 반환한다. 설정값 `"6mb"`는 그 5MB 파일과 나머지 폼 필드가 한 요청에 들어가게 올린 값이다. 코드가 5MB에 1MB를 더하는 식은 없다. 두 숫자가 파일에 따로 적혀 있다.

가입 스키마의 현재 검사는 이렇다.

| 이름 | 선언 | 현재 조건 |
| --- | --- | --- |
| `signupUserIdSchema` | `z.string().trim().regex(...)` | `^[a-z0-9_]{4,20}$`. 실패 문구는 “영문 소문자, 숫자, 밑줄(_)을 조합해 4~20자로 입력해주세요.” |
| `signupEmailSchema` | `z.string().trim().min(1).email()` | 비면 “이메일을 입력해 주세요.” 형식이 아니면 “이메일을 확인해 주세요.” |
| `signupPasswordSchema` | `z.string().refine(...)` | 길이 8~20, 영문, 숫자, 그 외 문자 각 하나. 문구는 “영문, 숫자, 특수문자를 포함한 8~20자로 입력해 주세요.” |
| `parseProfileImage` | `function` | `data:image/png` 또는 `data:image/jpeg`의 base64, 또는 `http:`/`https:` URL. gif·webp 접두사는 이 정규식에 없다 |

`profileImageFromForm`은 파일을 읽은 뒤 `` `data:${entry.type};base64,${bytes.toString("base64")}` ``를 `parseProfileImage`에 넘긴다. 허용 타입 집합은 호출부에서 png와 jpeg만 통과시킨다.

`next.config.ts`의 다른 값은 이 디자인 변경 전에도 있다. `images.remotePatterns`의 `i.pinimg.com`, `www.lgcns.com`, `cacheComponents: true`, `partialPrefetching: true`, `turbopack.rules`의 `@tailwindcss/turbopack`은 로그인 카드 클래스가 아니다.

참고: [serverActions.bodySizeLimit](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions#bodysizelimit), [Zod `regex`](https://zod.dev/api#regex), [MDN data URL](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data).
