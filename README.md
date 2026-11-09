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

현행 학습은 [S00~S11 공통 과정과 A01~A05 전문화](doc/integrated_curriculum.md)의 순서를 따릅니다. 일반 코딩 경험을 전제로 Python·C/C++ 문법 입문을 제외하고 AI·로봇 환경·패키지·ABI·CMake/colcon 등 도구 선수를 보충합니다. 현재 35모듈·207소주제·7경로이며 기존 ID·URL·저장 키는 유지합니다. 상세 교재는 153개이고 M34 3개와 P4 실행 패키지는 준비중입니다. [P1 비전 추적](examples/P1/README.md)·[P2 격자 이송](examples/P2/README.md)·[P3 다중 로봇 사건 감독](examples/P3/README.md)은 장비 없는 기본 실행 자료·웹 다운로드·수행근거 저장을 제공합니다. [순서 적용 기록](doc/v2/work_items/sequence-adoption.md)을 참고하세요.

V2 공유 카탈로그의 기준선은 [B01 안내](doc/v2/runtime_catalog.md), 상세 교재 집필·기존 원고 개정은 [E1 기록](doc/v2/work_items/E1.md), [E2 기록](doc/v2/work_items/E2.md), [E3 기록](doc/v2/work_items/E3.md), [E4 기록](doc/v2/work_items/E4.md), [E5 기록](doc/v2/work_items/E5.md)을 참고하세요. 새 상세 원고는 `ebook/curriculum/`에 있으며 웹의 **교재 본문**에서 기존 여섯 장과 함께 탐색합니다. 원고가 존재하는 것만으로 준비도가 올라가지는 않으며, 내용 검토와 정확한 원고 지문 승인이 필요합니다. `npm run prepare:authored`는 `e1-reviews.json`(M00~M03), `e2-reviews.json`(M05~M08), `e3-reviews.json`(M10~M12와 M14.01·M14.03·M14.06), `e4-reviews.json`(M19·M20·M21·M22·M27·M30·M32), `e5-reviews.json`(M09·M15·M17·M18) 및 `w01-reviews.json`(M31.01/.02)의 승인 정보를 함께 확인해 공개 메타데이터를 생성합니다. 카탈로그에 등록된 모든 모듈의 원고를 탐색하며, 해당 검수 기록과 정확한 원고 SHA-256이 일치하는 항목만 웹 본문·교재 목차·AI 참조에 공개합니다. 중복 승인, 잘못된 registry 형식·범위, 미등록 원고 경로, 누락된 원고·검수 근거는 생성 실패로 처리합니다. E3의 M14.02·M14.04·M14.05는 승인 범위 밖이며 M14 모듈 전체의 완료를 뜻하지 않습니다. 원고가 승인 뒤 바뀌면 현재 지문을 다시 검수·등록하기 전까지 공개하지 않습니다.

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

산출물은 `ebook/output/` 아래에 생성됩니다. 출판 입력은 E1·E2·E3·E4·E5 registry에서 현재 지문으로 승인된 상세 원고와 기존 여섯 장을 지원하며, 웹과 같은 원본을 사용합니다. PDF/EPUB 생성은 별도 요청이 있을 때만 수행하며, 원고 집필·웹 빌드 과정에서는 생성하지 않습니다.

프로젝트 자료는 `npm run prepare:projects`로 정적 ZIP/파일지문을 생성합니다. `doc/v2/inventory/project-reviews.json`의 정확한 승인 bundle SHA/evidence와 일치해야 생성하며 source 변경은 재검수·지문 등록 전까지 실패합니다. 앱의 predev/prebuild와 전체 pretest에 연결했습니다. 프로젝트 수행근거는 project:P1:* / project:P2:*의 별도 activity record로 저장해 단원 완료와 구분합니다. `node scripts/prepare-projects.mjs --inspect P2`는 파일을 게시하지 않고 검수할 현재 ZIP 지문을 출력합니다.
