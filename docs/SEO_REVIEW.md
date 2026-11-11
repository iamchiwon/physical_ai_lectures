# SEO 점검·최적화

2026-11-11 · main(f441748)에서 분기한 `seo/search-discovery` 작업. 사이트 URL은 저장소의 CORS 설정과 실제 HTTP 응답으로 확인한 `https://physical-ai-learning-web.pages.dev`를 기본값으로 사용한다.

## 발견한 문제

- 운영 `sitemap.xml`은 404였다. 앱에서 만드는 robots 파일이 없고 운영에서는 Cloudflare 관리 안내 텍스트만 확인됐다.
- 운영 홈에는 canonical이 없고, M00.01의 canonical은 상대 경로였다. 대부분 페이지의 설명은 사이트 공통 문구였다.
- 공유 카드·페이지별 OG/Twitter 정보와 사이트/학습자료/탐색경로 구조화 데이터가 없었다.
- 기존 교재의 다수 읽기 절에는 독립 페이지의 주 제목 H1이 없었다. 본문은 이미 정적 HTML에 있어 JavaScript만으로 제공되는 사이트는 아니었다.
- AI 참조 JSON·다운로드 원고와 학습 HTML의 색인 정책이 구분돼 있지 않았다.

## 변경

1. 모든 공개 페이지의 고유 제목·설명, 절대 canonical, OG/Twitter 정보와 한국어 locale을 제공한다. 학습 경로 query/hash는 canonical에서 제외한다. 코드/TeX를 검색 설명에 그대로 노출하지 않도록 정리한다.
2. 실제 공개 페이지의 canonical만 `sitemap.xml`에 넣고 본문 이미지도 연결한다. 준비중인 학습 단위는 noindex/사이트맵 제외한다. 근거 없는 lastmod·조회수·리뷰·평점·작성자/발행일은 만들지 않는다.
3. `robots.txt`는 검색에 필요한 HTML/CSS/JS/이미지 접근을 허용하고 사이트맵을 알린다. 내부 AI 자료·프로젝트 다운로드·원고 md는 Cloudflare `_headers`의 X-Robots-Tag로 noindex 처리하며 이미지 자산 전체를 막지 않는다. noindex는 접근 권한/비밀 보호 기능이 아니다.
4. WebSite, LearningResource, BreadcrumbList와 커리큘럼 CollectionPage/ItemList를 서버에서 출력한다. 현재 공개 내용과 목표만 기술하고 학생 답안·대화·진도는 포함하지 않는다. JSON-LD의 `<`를 이스케이프한다.
5. 기존 교재의 첫 제목을 페이지 H1으로 출력한다. 원본 Markdown·본문 수치·코드 블록·제목 anchor와 학습 URL은 유지한다. 문제 페이지의 별도 H1과 중복시키지 않는다.
6. 원래 사이트 스타일로 제작한1200×630 PNG 공유 카드를 사용한다. `scripts/build-social-card.py`는 `uv run --with pillow python scripts/build-social-card.py --font <한글폰트경로>`로 재생성할 수 있다. 원본 교재/생성 사진을 임의로 변경하지 않는다.
7. CF Pages 미리보기 브랜치는 noindex와 빈 사이트맵으로 운영 사이트와 구분한다. `SEO_INDEXABLE=false`로 별도 미러도 제외할 수 있다. canonical은 미리보기 호스트가 아닌 운영 주소를 가리킨다.
8. `npm run build:web` 후 실제 정적 HTML/XML을 자동 검사하도록 연결했다. `npm run check:seo`로 다시 검사할 수 있다.

## 설정과 배포 후 운영 확인

- Pages 빌드 환경의 `NEXT_PUBLIC_SITE_URL`은 대표 운영 origin으로 설정한다. 경로·쿼리·fragment·계정정보는 허용하지 않는다. 커스텀 도메인을 대표로 쓸 때는 운영/미리보기 모두 같은 origin을 사용하고 다른 호스트의301 정책은 별도로 설정한다.
- `SEO_PRODUCTION_BRANCH` 기본값은 main이다. production 브랜치가 다르면 명시한다. CF_PAGES=1이고 브랜치가 다르면 noindex가 적용된다. 같은 production artifact의 해시 주소는 canonical로 통합한다.
- 소유확인 값을 발급받은 경우 `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_NAVER_SITE_VERIFICATION`에 meta 태그의 content 값만 넣고 재빌드한다. 임의 토큰이나 다른 사람의 검증 정보를 만들지 않았다.
- 배포 후 운영 `/robots.txt`, `/sitemap.xml`, 대표 단원/원고·JSON의 HTTP 상태·캐시·X-Robots-Tag를 다시 확인한다. 로컬 Python 서버는 Cloudflare `_headers`를 적용하지 않는다. Cloudflare의 관리 robots/봇 설정이 실제 Googlebot/Yeti 수집을 막는지도 운영에서 확인한다.
- Google Search Console 및 네이버 서치어드바이저에서 대표 도메인의 소유확인을 하고 사이트맵을 제출한다. 대표 단원의 URL 검사/재수집·색인 제외 사유와 검색어/노출/클릭을 확인한다. 해당 계정 등록·외부 제출·배포는 이번 작업에 포함하지 않는다.

## 검증 범위

`docs/seo/verification.json`에 최종 수치를 기록한다. 전수 정적 검사는 canonical/고유 제목/설명/OG/공유 이미지/H1, 색인 정책, 사이트맵 일치, JSON-LD 형식·경로를 검사한다. 미리보기 noindex·소유확인 설정·XSS 방지·코드/수식 설명 정리는 회귀 테스트로 확인한다. 실제 브라우저에서는 JavaScript를 끈 상태에서도 홈·학습 단원·기존 교재의 본문/제목/메타데이터가 제공됨을 확인한다.

이는 작성자 자기검수이며 Google 리치 결과 자격 심사·실제 색인·검색 순위 상승·Core Web Vitals 현장 지표를 보장하지 않는다. PDF/EPUB는 생성하지 않는다.

## 기준 문서

- [Google 사이트맵](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google BreadcrumbList](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [네이버 사이트 등록/소유확인](https://searchadvisor.naver.com/guide/faq-start-register)
- [Cloudflare Pages 헤더](https://developers.cloudflare.com/pages/configuration/headers/)
- 설치된 Next.js16 문서의 metadataBase·sitemap/robots·JSON-LD 규약을 함께 확인했다.

## 최종 검수 결과

- 공개412페이지 모두 고유 제목·설명·절대 canonical·OG/Twitter·주 제목 H1 확인. 사이트맵412URL/175고유 이미지, LearningResource362개·BreadcrumbList255개 확인.
- 테스트196/196, 타입·린트·shared/web/API dry-run 빌드, 공개본 비노출3100텍스트/43압축항목, 기존207단위/152시각자료 검사를 통과했다.
- 정적415HTML/14296링크/7259자산 오류0. 기존 교재/현재207원고의 원본·목표/실습/해설과 학습 ID·저장 형식을 변경하지 않았다.
- 실제 브라우저에서 JavaScript를 꺼도 홈·M00.01·기존 좌표변환 교재의 본문/제목/메타·JSON-LD가 제공됐고 query가 canonical에 섞이지 않았다. 390px에서 기존 교재 주 제목 표시를 확인했다. 브라우저 저장 상태를 정확히 복구했다.
