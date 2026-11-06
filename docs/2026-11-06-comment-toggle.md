# 댓글 목록을 체크박스로 열고 닫는 Tailwind

- 날짜: 2026-11-06
- 앱: `lgcns-fe-next`
- 기준 코드: `component/organisms/PostCard.tsx`, `component/atoms/PostCommentCount.tsx`
- 이 문서는 그 두 파일에 지금 있는 클래스만 설명한다. React `useState`로 댓글 목록을 열지 않는다.

댓글 수는 `<label>`이다. 그 라벨이 카드 안의 체크박스를 켜고 끈다. Tailwind는 그 체크 상태를 CSS `:has()`와 `:checked`로 읽어서, 라벨 색과 댓글 목록의 `display`만 바꾼다.

## 1. 세 조각이 어디에 있는가

`PostCard`의 댓글 영역은 이 순서다.

```tsx
<div className="group/comments ...">
  <input
    id={`comments-${post.id}`}
    type="checkbox"
    defaultChecked={full}
    className="comments-toggle sr-only"
  />
  <PostCommentCount count={post.commentCount} htmlFor={`comments-${post.id}`} />
  <div className="hidden ... group-has-[.comments-toggle:checked]/comments:flex">
    {/* 댓글 목록과 입력 */}
  </div>
</div>
```

`PostCommentCount`는 버튼을 만들지 않는다. `htmlFor`를 받은 `<label>`이다.

| 조각 | 파일 | 하는 일 |
| --- | --- | --- |
| `group/comments` | `PostCard`의 바깥 `div` | 이 카드의 댓글 영역이라는 이름을 붙인다 |
| `input.comments-toggle` | 같은 `div`의 첫 자식 | 열림 상태를 가진다. 화면에는 보이지 않는다 |
| `label[htmlFor]` | `PostCommentCount` | 클릭하면 그 `id`의 체크박스를 토글한다 |
| 목록 `div` | `PostCard` | 체크되어 있으면 `display: flex`, 아니면 `display: none` |

`id`는 `comments-` 뒤에 글 id를 붙인다. 카드가 여러 개여도 라벨은 자기 카드의 체크박스만 움직인다.

`defaultChecked={full}`이라 상세 화면(`full`)은 처음부터 체크된 HTML로 그려진다. 목록 화면은 체크되지 않은 채로 시작한다. `checked`가 아니라 `defaultChecked`이므로, 이후 클릭은 브라우저가 이 입력의 상태를 가진다. React가 다시 그려도 이 값을 매번 덮어쓰지 않는다.

## 2. 클래스 이름을 나누면

`group-has-[.comments-toggle:checked]/comments:flex`는 한 유틸리티다. 조각은 이렇다.

| 조각 | 뜻 |
| --- | --- |
| `group-has-` | 이름 붙은 `group` 조상이, 고른 자손을 가지고 있을 때 이 요소에 스타일을 준다 |
| `[.comments-toggle:checked]` | 그 자손의 조건. 클래스가 `comments-toggle`이고 `:checked`인 요소 |
| `/comments` | 조상의 그룹 이름. `group/comments`와 짝이다 |
| `:flex` | 조건이 참일 때 적용할 유틸리티. `display: flex` |

라벨의 `group-has-[.comments-toggle:checked]/comments:bg-[#dbeafe]`와 `:text-[#1d4ed8]`도 같은 조건이다. 참이면 배경과 글자색만 바뀐다.

Tailwind가 만드는 선택자는 CSS `:has()`다. 그룹 요소가 `.comments-toggle:checked`를 자손으로 두면, 그 그룹 안의 이 클래스를 가진 요소에 선언이 적용된다. `:checked`는 체크박스가 켜진 상태다.

참고: [Tailwind, 자손 상태로 스타일](https://tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-descendant-state), [Tailwind, 중첩 그룹 이름](https://tailwindcss.com/docs/hover-focus-and-other-states#differentiating-nested-groups), [MDN :has()](https://developer.mozilla.org/en-US/docs/Web/CSS/:has), [MDN :checked](https://developer.mozilla.org/en-US/docs/Web/CSS/:checked).

## 3. 왜 `peer`가 아닌가

`peer` / `peer-checked`는 체크박스 뒤에 나오는 형제만 꾸밀 수 있다. 이 카드의 댓글 수는 체크박스의 형제가 아니다. 액션 줄을 감싼 `div` 안에 있다.

목록 영역은 체크박스의 뒤 형제라 `peer-checked:flex`로도 열 수 있다. 댓글 수 라벨은 그 형제의 자식이라 `peer-checked`가 닿지 않는다. 그래서 라벨과 목록이 같은 조건인 `group-has-.../comments`를 쓴다. 그룹 이름은 `comments`다. 카드 안에 다른 `group`이 있어도 이 이름끼리만 연결된다.

## 4. 열리고 닫히는 순서

1. 사용자가 `댓글 {count}` 라벨을 클릭한다.
2. HTML `label`의 `for`와 입력 `id`가 같아서 브라우저가 체크박스를 토글한다. React `onClick`은 없다.
3. 체크되면 입력은 `:checked`가 된다. 클래스 `comments-toggle`은 그대로다.
4. `group/comments`가 `:has(.comments-toggle:checked)`를 만족한다.
5. 목록 `div`의 `group-has-[...]/comments:flex`가 `display: flex`를 준다. 꺼지면 이 선언은 빠지고 `hidden`인 `display: none`만 남는다.
6. 라벨은 같은 조건으로 배경 `#dbeafe`, 글자 `#1d4ed8`이 된다. 꺼지면 기본값인 배경 `#f3f4f6`, 글자 `#4b5563`이다.

목록 `div`에는 `hidden`과 `flex-col`이 항상 있다. `hidden`은 `display: none`이다. `flex-col`은 `flex-direction: column`이라 `display`를 바꾸지 않는다. 체크된 동안에만 `:flex`가 `display`를 `flex`로 바꿔서 `flex-col`이 보이게 된다.

`comments-toggle`에는 `sr-only`가 있다. 화면에서는 치우치고, `display: none`은 아니다. 스크린 리더는 이 체크박스를 읽을 수 있고, `:checked`도 유지된다.

참고: [Tailwind display](https://tailwindcss.com/docs/display), [Tailwind sr-only](https://tailwindcss.com/docs/screen-readers), [MDN label](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label), [MDN checkbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox).

## 5. 이 스타일이 언제 적용되는가

`app/globals.css`는 `@import "tailwindcss"`로 Tailwind 4를 불러온다. `PostCard`와 `PostCommentCount`의 `className` 문자열은 빌드할 때 CSS 규칙으로 바뀐다. 브라우저가 클릭할 때마다 새 CSS를 받지 않는다.

`PostCard` 파일 첫 줄은 `"use client"`다. Next가 그 컴포넌트 HTML을 먼저 보내고, 이후 클라이언트 번들로 hydrate한다. 댓글을 열고 닫는 일은 그 번들의 함수가 아니다. 서버가 보낸 HTML의 `label`과 `input`, 그리고 이미 받아 둔 CSS가 처리한다. 페이지의 `<script>`에 `async`, `defer`, `type="module"`을 붙여 이 토글을 실행하지 않는다.

좋아요, 답글, 댓글 등록은 그대로 서버 액션이다. 그 동작은 이 체크박스와 연결되어 있지 않다.

참고: [Tailwind 설치](https://tailwindcss.com/docs/installation), [Next.js 서버 컴포넌트와 클라이언트 컴포넌트](https://nextjs.org/docs/app/getting-started/server-and-client-components).

## 6. 이 코드가 하지 않는 일

- 댓글 목록을 `useState`나 `aria-expanded`로 열지 않는다.
- `peer-checked`를 쓰지 않는다.
- 체크 상태를 서버나 쿠키에 저장하지 않는다. 새로고침하면 `defaultChecked={full}`인 처음 상태로 돌아간다.
- 다른 카드의 댓글 목록을 같이 열지 않는다. `id`가 글마다 다르다.
