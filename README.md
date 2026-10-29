# Physical AI 로봇 제어 실무

교과서·자습 콘텐츠, 브라우저 가상실습, Gemini AI 강사를 하나의 서비스로 제공하는 Cloudflare 모노레포입니다.

## 구조

```text
apps/
├── web/                 # Next.js static export → Cloudflare Pages
└── api/                 # Hono Worker + Gemini + D1 → Cloudflare Workers
packages/
└── shared/              # 공유 Zod schema, API type, constant
ebook/
├── book/                # 원본 교과서 소스
├── output/              # PDF/EPUB/HTML 산출물
├── reviews/             # 교재 검수 기록
├── shared/              # 이북 스타일·템플릿
├── tools/               # 이북 빌드 도구
└── tmp/                 # 이북 빌드 임시 자료
```

프론트엔드는 `out/` 정적 파일만 배포하며 SSR·Next.js Route Handler·Node.js 서버를 사용하지 않습니다. Gemini 요청, Live 음성 세션 토큰, D1 진도 동기화는 별도 Worker API가 담당합니다.

## 로컬 실행

```bash
npm install
npm run db:migrate:local
npm run dev
```

- Web: `http://localhost:3000`
- API: Wrangler가 표시하는 로컬 Worker URL
- API 비밀값: `apps/api/.dev.vars.example`을 `apps/api/.dev.vars`로 복사
- Web API URL: `apps/web/.env.example`을 `apps/web/.env.local`로 복사

## 검증

```bash
npm run check
npm run lint
npm run build
```

## 배포

- Pages root directory: 저장소 루트
- Pages build command: `npm run build:web`
- Pages output directory: `apps/web/out`
- Worker deploy: `npm run deploy:api`

최초 배포 전 D1 database ID, Pages/Worker origin, Gemini secret을 설정해야 합니다. 상세 순서는 [Cloudflare 배포 가이드](docs/CLOUDFLARE_DEPLOYMENT.md)를 참고하세요.

## 이북 빌드

```bash
./ebook/tools/build_book.sh
```

산출물은 `ebook/output/` 아래에 생성됩니다.
