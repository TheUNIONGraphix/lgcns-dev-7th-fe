# EventSource 사용 시 주의점과 장단점

- 날짜: 2026-11-06
- 앱: `lgcns-fe-next`
- 기준 코드: `component/molecules/NotificationStream.tsx`, `component/organisms/NotificationMenu.tsx`, `app/api/notifications/stream/route.ts`, `service/notificationService.ts`, `service/notificationWatch.ts`
- 이 문서는 그 파일에 지금 있는 `EventSource`만 설명한다. 알림 행이 생기는 조건과 메뉴의 읽음 처리는 `docs/2026-11-06-notification.md`에 있다.

알림 메뉴는 브라우저의 `EventSource`로 `GET /api/notifications/stream`을 연다. 서버는 `text/event-stream` 본문을 연결이 끝날 때까지 이어서 쓴다. 이 경로는 서버에서 브라우저로만 흐른다. 읽음 처리는 이 연결에 실리지 않고 서버 액션으로 따로 나간다.

## 1. 연결이 어디에 생기는가

`NotificationStream`은 `"use client"` 파일이다. `useEffect` 안에서 `new EventSource("/api/notifications/stream")`을 호출한다. 두 번째 인자는 없다. `withCredentials`는 기본값 `false`다.

`NotificationMenu`는 로그인되어 있고 서버가 넘긴 `notifications`가 있을 때만 이 컴포넌트를 그린다. 그때 `enabled`가 참이다. 로그아웃이거나 목록이 `null`이면 메뉴가 `null`을 반환하고, effect 정리 함수가 `close()`를 호출한다.

| 파일 | 선언 | 실행 시점 |
| --- | --- | --- |
| `NotificationStream.tsx` | `"use client"`. `useEffect` 안의 `new EventSource` | hydrate 이후, `enabled`이고 탭이 `visible`일 때 |
| `stream/route.ts` | `export async function GET`. 첫 호출은 `await connection()` | 그 GET이 살아있는 동안 스트림 본문을 쓴다 |
| `notificationWatch.ts` | `function subscribe`. `globalThis`의 허브 | 그 프로세스에 구독자가 있을 때 컬렉션 `Notification`의 change stream 하나 |

페이지 HTML에는 이 연결을 여는 `<script src>`가 없다. `async`, `defer`, `type="module"`로 붙는 스크립트가 아니다. `"use client"` 번들이 hydrate된 뒤 effect가 DOM API `EventSource`를 만든다. 첫 배지는 그 연결 전에 서버 렌더가 그린 목록이다.

참고: [HTML 서버 전송 이벤트](https://html.spec.whatwg.org/multipage/server-sent-events.html), [MDN EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource), [MDN EventSource 생성자](https://developer.mozilla.org/en-US/docs/Web/API/EventSource/EventSource), [React useEffect](https://react.dev/reference/react/useEffect), [Next.js connection](https://nextjs.org/docs/app/api-reference/functions/connection).

## 2. 브라우저가 받는 프레임

라우트는 이벤트를 이렇게 쓴다.

| 순서 | 본문 | 브라우저 동작 |
| --- | --- | --- |
| 연결 직후 | `retry: 10000\n\n` | 재연결 대기 시간을 10000밀리초로 둔다. `onmessage`는 호출되지 않는다 |
| change stream이 준비된 뒤 | `data: {"type":"snapshot",...}\n\n` | `onmessage`의 `data`로 JSON 문자열만 올라온다 |
| 그 사이 쌓인 변경, 이후 변경 | `data: {"type":"insert"\|"read"\|"delete",...}\n\n` | 같은 `onmessage` |
| 25초마다 | `: ping\n\n` | 콜론으로 시작하는 주석이다. `onmessage`로 올라오지 않는다 |

`event:` 필드는 없다. 그래서 이벤트 타입은 기본값 `message`이고, 코드는 `source.onmessage`만 둔다. `addEventListener("insert", ...)` 같은 이름 붙인 이벤트는 오지 않는다. 종류는 JSON의 `type`으로 가른다.

`id:` 필드도 없다. 브라우저는 마지막 이벤트 id를 기억하지 않고, 재연결 요청에 `Last-Event-ID`를 붙이지 않는다. 끊긴 뒤의 복구는 커서 재개가 아니라 새 GET이다. 그 응답이 다시 `snapshot`을 보낸다. 스냅샷의 항목은 `listForUser`와 같이 최신 20개이고, `unreadCount`는 그 20개가 아니라 안 읽은 행 전체 수다.

`parseEvent`는 `JSON.parse`에 실패하거나 `type`이 없으면 `null`을 반환한다. 그 프레임은 버려지고 연결은 유지된다.

참고: [MDN 서버 전송 이벤트 형식](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format).

## 3. 이 알림에 맞는 점

- 방향이 하나다. 서버가 알림을 밀어 주고, 브라우저는 받기만 한다. 읽음과 모두 읽음은 `FormData` 서버 액션이다. 이 소켓으로 브라우저가 메시지를 보낼 필요가 없다.
- 프레임을 브라우저가 자른다. `data:`와 빈 줄만 맞추면 `onmessage`가 한 이벤트씩 온다. 클라이언트가 버퍼를 직접 나누지 않는다.
- 연결이 끊기면 브라우저가 다시 연다. 서버가 보낸 `retry: 10000`이 그 간격이다. `close()`를 호출하기 전에는 이 재시도를 코드가 직접 돌리지 않는다.
- 주소가 같은 출처의 `/api/notifications/stream`이다. 생성자에 옵션이 없으면 자격 증명 모드는 `same-origin`이라, 이 출처의 세션 쿠키는 실리고 다른 출처의 쿠키는 실리지 않는다. `Authorization` 헤더를 붙일 자리가 없어도 로그인 세션으로 `readCurrentUser`가 사용자를 가른다.
- 변경이 있을 때 도착한다. 5초마다 목록을 다시 읽는 경로는 없다. 25초 `: ping`은 목록 조회가 아니라, 중간에 있는 서버가 조용한 응답을 끊지 않게 하는 주석이다.
- 스냅샷 전에 도착한 변경은 서버 배열에 두었다가 스냅샷 다음에 보낸다. 메뉴는 스냅샷으로 목록을 갈아끼운 뒤 `insert`를 앞에 붙이고, 같은 id는 다시 넣지 않는다.
- 탭이 숨으면 `close()`로 그 문서의 연결을 끝낸다. `close()`는 `readyState`를 `CLOSED`로 두고 자동 재연결을 멈춘다. 다시 보이면 새 `EventSource`를 만들고, 서버가 스냅샷으로 그 사이 목록을 맞춘다.
- change stream은 프로세스당 하나다. SSE 응답마다 MongoDB 커서를 만들지 않고, `recipientId`가 같은 리스너에게만 넘긴다. 보이는 탭이 여러 개면 HTTP 응답은 탭 개수만큼이고, 커서는 그 프로세스에서 하나다.

참고: [MDN visibilityState](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState), [MDN visibilitychange](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event), [MongoDB change streams](https://www.mongodb.com/docs/manual/changeStreams/).

## 4. 단점과 이 코드에서의 주의

### 요청을 꾸밀 수 없다

`EventSource`는 GET만 보낸다. 본문, 메서드, 요청 헤더를 지정하는 인자가 없다. 이 라우트도 GET만 export한다. 토큰을 헤더로 실어야 하는 API에는 쓸 수 없고, 지금은 같은 출처 쿠키로 막는다.

`withCredentials: true`를 넘기지 않는다. 다른 출처로 쿠키를 보내는 설정이 아니다. 스트림 URL을 다른 출처로 바꾸면 세션 쿠키가 빠지고, 라우트는 401과 빈 본문을 반환한다.

### 상태 코드를 읽을 수 없다

`onmessage`만 있다. `onerror`는 없다. 오류 이벤트에는 HTTP 상태 코드가 실리지 않는다. 응답이 200이 아니거나 `Content-Type`이 `text/event-stream`이 아니면 브라우저는 연결 실패로 보고, `close()` 전에는 `retry` 간격으로 다시 요청한다.

세션이 서버에서 끝났는데 메뉴의 `isLoggedIn`이 아직 참이면, 컴포넌트는 마운트된 채로 남고 브라우저는 10초마다 401을 다시 받는다. 로그아웃으로 메뉴가 `null`이 되면 정리 함수의 `close()`가 그 재시도를 멈춘다.

### 재연결은 이어 받기가 아니다

`id:`가 없으므로 `Last-Event-ID` 재개가 없다. 숨겼던 탭, 네트워크 끊김, 서버 재시작 뒤에는 최신 20개와 안 읽은 개수 스냅샷이 기준이다. 그 20개 밖에 있던 항목의 중간 이벤트는 이 연결로 다시 오지 않는다. 화면에 없는 안 읽은 행이 지워져도 배지는 그 `delete`만으로는 줄지 않고, 다음 스냅샷의 `unreadCount`가 맞춘다.

숨은 동안에는 연결 자체가 없다. 그 사이 토스트는 뜨지 않는다. 다시 보일 때 스냅샷의 안 읽은 항목 중, 이미 본 id 집합에 없는 것만 토스트가 된다.

### 텍스트 한 줄 프로토콜이다

본문은 UTF-8 텍스트다. 바이너리 프레임은 없다. 한 이벤트는 `data:` 한 줄과 빈 줄이다. JSON이 깨지면 그 이벤트만 버린다. `event:`로 타입을 나누지 않았으므로, 리스너를 종류별로 나눌 수 없고 `type` 문자열이 계약이다.

### 연결을 오래 붙잡는다

보이는 로그인 문서마다 응답 하나가 열린 채로 남는다. HTTP/1.1에서는 브라우저가 한 호스트에 동시에 여는 연결 수가 작다. 이 스트림이 그 자리 하나를 계속 쓴다. HTTP/2에서는 여러 스트림이 연결 하나를 나눈다. 이 저장소는 그 프로토콜을 지정하지 않는다. 배포 앞단이 정한다.

중간에 있는 프록시가 응답을 모았다가 보내면 이벤트가 늦게 도착한다. 라우트는 `Cache-Control: no-cache, no-transform`, `X-Accel-Buffering: no`를 둔다. `no-transform`은 중간 서버가 본문을 압축하거나 고치지 말라는 표시다. 25초 주석은 본문이 비어 보이지 않게 한다. 이 헤더를 무시하는 앞단이면 주석만으로 늦어짐을 막지 못한다.

`connection()`은 이 GET을 정적 응답으로 끝내지 않고, 실제 요청이 들어온 뒤에 스트림을 시작하게 한다. 라우트 파일에는 `maxDuration`이 없다. 호스트가 긴 응답을 직접 자르면 브라우저의 재연결과 다음 스냅샷이 그 뒤를 맡는다.

### effect가 연결의 수명이다

의존성은 `enabled`와 `onEvent`다. 메뉴의 `onEvent`는 `useCallback`으로 감싸져 있다. 이 함수를 렌더마다 새로 만들면 effect가 정리되면서 `close()`하고 곧바로 다시 연다. 스냅샷 요청이 렌더 횟수만큼 나간다.

정리는 `visibilitychange` 리스너를 제거하고 `close()`한다. 숨김과 언마운트가 같은 `close()`를 쓴다. 숨긴 뒤에는 자동 재연결이 돌지 않는다. 다시 보일 때 `open()`이 새 객체를 만든다. 이미 `source`가 있거나 탭이 숨은 상태면 `open()`은 바로 반환한다.

### 이벤트를 받는 프로세스가 정해진다

허브는 그 Node 프로세스의 `globalThis`에 있다. `EventSource`가 붙은 프로세스가 자기 change stream으로 그 연결에 쓴다. 프로세스가 여러 개면 구독자가 있는 프로세스마다 커서가 생긴다. 한 응답이 다른 프로세스의 메모리 리스너로 건너가지는 않는다.

change stream은 레플리카 셋에서 열린다. 단독 MongoDB에서는 커서가 열리지 않는다. 그때도 라우트는 스냅샷을 보낼 수 있고, 첫 화면 목록은 서버 렌더에 남아 있다. 그 뒤의 `insert`, `read`, `delete`는 오지 않는다.

## 5. 다른 방식과 나란히 보면

| | 이 앱의 `EventSource` | 주기적 GET | `fetch`로 스트림 읽기 | 웹소켓 |
| --- | --- | --- | --- | --- |
| 방향 | 서버 → 브라우저 | 브라우저가 매번 요청 | 서버 → 브라우저 | 양방향 |
| 프레임 | 브라우저가 `data:`를 자른다 | JSON 본문 하나 | 클라이언트가 청크를 나눠야 한다 | 별도 프레임 |
| 끊긴 뒤 | `retry` 뒤 자동 재연결. 여기는 스냅샷으로 맞춘다 | 다음 주기에 다시 요청 | 재연결을 직접 작성 | 재연결을 직접 작성 |
| 헤더와 본문 | 지정 불가. 같은 출처 쿠키 | 요청마다 지정 가능 | 지정 가능. 상태 코드를 읽을 수 있다 | 최초 요청 헤더는 가능. 이후는 소켓 메시지 |
| 이 저장소 | 알림 스트림이 이 방식 | 알림 목록의 5초 재조회는 없다 | 이 경로에는 없다 | 이 경로에는 없다 |

`PostLiveRefresh`의 5초 `router.refresh`는 글 화면을 다시 그리는 경로다. 알림 `EventSource`의 간격이 아니다.

## 6. 이 코드가 하지 않는 일

- `new EventSource(url, { withCredentials: true })`를 쓰지 않는다.
- `id:`와 `Last-Event-ID`로 이벤트를 이어 받지 않는다.
- `event:` 필드로 리스너를 나누지 않는다.
- `onerror`에서 401을 보고 재연결을 멈추지 않는다. 멈춤은 `close()`뿐이다.
- 이 연결로 읽음 요청을 보내지 않는다.
- 바이너리나 웹소켓으로 알림을 보내지 않는다.
- 숨은 탭의 연결을 유지하지 않는다.
