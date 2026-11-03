# Physical AI 로봇 제어 실무

교과서·자습 콘텐츠, 브라우저 가상실습, OpenRouter AI 강사를 하나의 서비스로 제공하는 Cloudflare 모노레포입니다.

## 구조

```text
apps/
├── web/                 # Next.js static export → Cloudflare Pages
└── api/                 # Hono Worker + OpenRouter → Cloudflare Workers
packages/
└── shared/              # 공유 Zod schema, API type, constant
ebook/
├── book/                # 기존 여섯 장 응용 교재(승인 개정 포함)
├── curriculum/          # 확장 과정의 상세 교재(M00~M03)
├── output/              # PDF/EPUB/HTML 산출물
├── reviews/             # 교재 검수 기록
├── shared/              # 이북 스타일·템플릿
├── tools/               # 이북 빌드 도구
└── tmp/                 # 이북 빌드 임시 자료
```

프론트엔드는 `out/` 정적 파일만 배포하며 운영 시 SSR·동적 Route Handler·Node.js 서버가 필요하지 않습니다. AI 참조 JSON의 GET 경로도 빌드 시 정적 파일로 생성합니다. 학습 진도와 퀴즈 점수는 브라우저 `localStorage`에 저장하고, OpenRouter 텍스트 채팅 요청은 별도 Worker API가 담당합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

- Web: `http://localhost:3000`
- API: Wrangler가 표시하는 로컬 Worker URL
- API 비밀값: `apps/api/.dev.vars.example`을 `apps/api/.dev.vars`로 복사
- Web API URL: `apps/web/.env.example`을 `apps/web/.env.local`로 복사

## 검증

```bash
npm test
npm run check
npm run lint
npm run build
```

V2 공유 카탈로그의 기준선은 [B01 안내](doc/v2/runtime_catalog.md), 상세 교재 집필·기존 원고 개정은 [E1 기록](doc/v2/work_items/E1.md)을 참고하세요. 새 상세 원고는 `ebook/curriculum/`에 있으며 웹의 **교재 본문**에서 기존 여섯 장과 함께 탐색합니다. 원고가 존재하는 것만으로 준비도가 올라가지는 않으며, 내용 검토와 정확한 원고 지문 승인이 필요합니다. `npm run prepare:authored`는 승인 정보를 확인해 공개 메타데이터를 생성합니다.

## 배포

- Pages root directory: 저장소 루트
- Pages build command: `npm run build:web`
- Pages output directory: `apps/web/out`
- Worker deploy: `npm run deploy:api`

최초 배포 전 Pages/Worker origin과 OpenRouter secret을 설정해야 합니다. 상세 순서는 [Cloudflare 배포 가이드](docs/CLOUDFLARE_DEPLOYMENT.md)를 참고하세요.

## 이북 빌드

```bash
./ebook/tools/build_book.sh
```

산출물은 `ebook/output/` 아래에 생성됩니다. 현재 지문으로 승인된 E1 상세 원고를 기존 여섯 장 앞에 포함하며, 웹과 같은 원본을 사용합니다. 실제 PDF/EPUB 산출물 재생성은 이 명령을 실행하는 별도 단계입니다.
