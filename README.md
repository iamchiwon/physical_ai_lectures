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
├── curriculum/          # 확장 과정의 상세 교재(승인 원고 공개)
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

V2 공유 카탈로그의 기준선은 [B01 안내](doc/v2/runtime_catalog.md), 상세 교재 집필·기존 원고 개정은 [E1 기록](doc/v2/work_items/E1.md)과 [E2 기록](doc/v2/work_items/E2.md)을 참고하세요. 새 상세 원고는 `ebook/curriculum/`에 있으며 웹의 **교재 본문**에서 기존 여섯 장과 함께 탐색합니다. 원고가 존재하는 것만으로 준비도가 올라가지는 않으며, 내용 검토와 정확한 원고 지문 승인이 필요합니다. `npm run prepare:authored`는 `e1-reviews.json`(M00~M03)과 `e2-reviews.json`(M05~M08)의 승인 정보를 함께 확인해 공개 메타데이터를 생성합니다. 카탈로그에 등록된 모든 모듈의 원고를 탐색하며, 해당 검수 기록과 정확한 원고 SHA-256이 일치하는 항목만 웹 본문·교재 목차·AI 참조에 공개합니다. 중복 승인, 잘못된 registry 형식·범위, 미등록 원고 경로, 누락된 원고·검수 근거는 생성 실패로 처리합니다. 원고가 승인 뒤 바뀌면 현재 지문을 다시 검수·등록하기 전까지 공개하지 않습니다.

원고 경로는 `ebook/curriculum/<모듈 ID>/<소주제 ID>.md`입니다. JSON frontmatter와 본문·실습·실습 해설·확인 문제·해설·참고 자료의 여섯 절, Q1~Q3의 문제/개별 해설을 공통 parser로 읽습니다. 승인 registry를 갱신한 뒤 `npm run prepare:authored`를 실행하세요. 이 명령은 메타데이터만 생성하며 배포나 PDF/EPUB 생성을 수행하지 않습니다. 기존 교재 파일과 등록된 앱 학습 활동의 source를 개정할 때는 `doc/v2/inventory/legacy-revisions.json`에 원래 지문·현재 지문·검수 근거를 기록합니다. 기준선은 기존 카탈로그의 등록 source에서 가져오며 임의 파일을 승인 대상으로 추가하지 않습니다.

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

산출물은 `ebook/output/` 아래에 생성됩니다. 현재 지문으로 승인된 E1·E2 상세 원고를 기존 여섯 장 앞에 포함하며, 웹과 같은 원본을 사용합니다. 실제 PDF/EPUB 산출물 재생성은 이 명령을 실행하는 별도 단계입니다.
