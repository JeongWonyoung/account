# 투네이션 계정 플로우 목업

TOO_UI설계서 v3.3(공통 p.18–82)의 회원가입 · 로그인 · 2차 인증 · 차세대 통합회원 전환 · 아이디/비밀번호 찾기를 케이스별로 골라 진행하는 동작 목업입니다.

- 게시본: https://claude.ai/artifact/3SMBoBaBHvPmaHXDN64heL
- 진행 시나리오 문서: [`시나리오.md`](시나리오.md)

## 공유 · 복사

폴더를 통째로 복사하되 `node_modules`, `dist`, `bundle.html`은 빼고 전달합니다(모두 다시 생성됨).
받은 쪽에서 아래 명령으로 의존성을 새로 설치합니다. 패키지 버전을 그대로 맞추려면 `npm install` 대신 `pnpm install`을 사용하세요(`pnpm-lock.yaml` 기준).

## 실행

Node 18 이상이 필요합니다. 글꼴은 Google Fonts에서 불러오므로 인터넷 연결이 필요합니다.

```bash
npm install
npm run dev
```

## 수정할 위치

| 파일 | 내용 |
|---|---|
| `src/mock/data.ts` | 케이스 목록, 하위 케이스, 단계별 설계서 페이지 · 검증 포인트 · ⚡ 시뮬레이션 버튼, 테스트 데이터, 설계서 확인 사항 |
| `src/mock/screens.tsx` | 각 화면(로그인, 약관, 인증 유형, 전환 안내 등)과 화면 간 이동 규칙 |
| `src/mock/ui.tsx` | 공통 UI(버튼, 입력, 모달, 토스트)와 유효성 검사 문구(설계서 p.30, p.81) |
| `src/mock/Runner.tsx` | 왼쪽 시나리오 패널, 브라우저 프레임, PASS · OAuth 목업 팝업 |
| `src/mock/Entry.tsx` | 첫 화면(케이스 선택 · 진행 시나리오 · 설계서 확인 사항 탭) |
| `src/index.css`, `tailwind.config.js` | 색상 토큰. 제품 화면은 `brand`, `p-*`, 바깥 작업 화면은 CSS 변수 |

새 화면을 추가할 때는 `data.ts`의 `ScreenId`에 이름을 넣고, `screens.tsx`의 `SCREENS`에 컴포넌트를 등록한 뒤, 해당 케이스의 `steps`에 연결합니다.

## 게시용 단일 HTML 만들기

```bash
npm run bundle
```

`bundle.html`이 생성됩니다. Claude Code에서 이 파일을 Artifact로 게시하면 됩니다.
기존 링크를 그대로 갱신하려면 그 Artifact에 대한 편집 권한이 있어야 하며, 게시할 때 기존 URL을 지정해 달라고 요청하세요.
