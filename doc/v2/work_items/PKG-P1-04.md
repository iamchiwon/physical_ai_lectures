# PKG-P1-04 · 웹·수행근거 저장·관련 AI 연결

- 날짜: 2026-11-09 / 상태: 통과·완료(웹 연결 범위).
- 선행: PKG-P1-03 실제 실행/해설/132회귀 통과.
- 범위: P1 실행자료 ZIP/파일SHA 명세의 정적생성·프로젝트 페이지 연결·기존답안UI에 의한 수행근거/자기검토 저장·관련단원AI질문/단계복귀. 실제ROS/장비 실행·프로젝트자동완료·외부배포는 제외한다.

## 사전 기준

1. ZIP은 명시한 P1 source/config/input/SPEC/README/SOLUTION/reference8파일만 포함하고 source와 byte/SHA가 일치한다. 정적 build로 재생성하고 모델/패키지 다운로드를 요구하지 않는다.
2. P1 안내/자료에서 실제구현 범위·Python/플랫폼·재생/합성폐루프/ROS미검증을 명확히 한다. P2~P4 실행 패키지는 준비중 유지한다.
3. 기존 AuthoredResponse/learningStore로 project:P1 네 근거를 별도 revision에 저장/자기검토한다. 단원739Activity/137원고·전체207unit 수량이나 학습자 완료로 자동 합산하지 않는다. 옛답안/완료와 충돌하지 않는다.
4. AI는 관련 M12.01/M05.02 실제단원에서 질문하며 프로젝트 실행자료가 자동전달된다고 주장하지 않는다. 필요한 관찰을 질문에붙여 current단원본문을 참조하게 한다.
5. 실제320px·키보드·다운로드byte/SHA·답안재로드·기존기록보존·AI연결·내부링크/자산·테스트/타입/린트/빌드와 원래브라우저저장 복원을 검수한다.

## 구현·탈고

- `prepare-projects.mjs`가 명시한8파일만 고정순서·고정ZIP시각으로 묶고 파일별SHA/크기·ZIP SHA·수행근거 revision을 만든다. 정적 predev/prebuild와 pretest에 연결했다. 별도 출판 exporter나 Python패키지 설치는 없다.
- P1은 ZIP/명세·Python/플랫폼·실행범위·재생/합성폐루프 한계를 제공한다. P2~P4는 준비중이다. 홈/단계/트랙 문구도 프로젝트별 실제제공범위에 맞췄다.
- 기존 AuthoredResponse/learningStore를 재사용하여 project:P1:inputs/failures/feedback/scope를 ZIP revision별로 저장한다. 프로젝트자동완료를 추가하지 않고 기존739Activity/207unit·완료집계를 유지한다.
- 프로젝트기록은 AI에 자동전달된다고 쓰지 않는다. M12.01/M05.02 실제단원 질문으로 연결하고 필요한관찰을 질문에 붙이도록 안내한다.
- React/Next지침과 실제설치본 static-export문서를 읽고 서버정적렌더링·작은기존clientcomponent재사용·안정key·명시label·키보드/다운로드·저장schema/버전보존을 검토했다. 새 effect/원격fetch·거대한clientcatalog전달은 추가하지 않았다.

## 실제 검수

- 기본코드4종+다운로드archive일관성 포함 전체133테스트·타입·린트·전체빌드 통과. API는Worker dry-run, Next생성파일은원본복원했다. 로그 `/tmp/pkg-p1-04-{test,check,lint,build}.log`.
- HTML414/링크13,425/자산7,130 오류0, corpus207 유지. archive는 Pythonzipfile의CRC검사·8파일byte와SHA를 실제source에대조했다.
- 320px의 P1~P4페이지에서 가로넘침/JS오류/준비됨배지0 확인. P1다운로드/답안4개, P2~P4는준비중/답안0개다. 실제P1스크린샷도 확인했다.
- 실제키보드 ZIP다운로드→저장한file SHA를공개manifest와대조했다. 네수행근거저장·자기검토·재로드, 이전프로젝트revision답안의별도보관, 기존단원답안8/완료2와unitProgress/lastLocation불변을확인했다.
- 관련AI단원M12.01로실제키보드이동했고 RGB/BGR질문·본문선택을기존AI패널에서수행했다. 요청의currentunit/source와실제RGB본문을확인했다. health/summary/답변은fetch fixture며외부모델품질은검증하지않았다.
- P1단계카드의실행자료안내와원래physical-ai local/sessionStorage정확복원·대조,private backup삭제완료. 근거 `/tmp/pkg-p1-{browser,static}.json`, `pkg-p1-browser-downloaded.zip`, `pkg-p1-related-ai-request.json`, `pkg-p1-mobile.png`.

사전5기준충족·자기검수통과. 다음은 PKG-P1-05 별도차수검토·최종근거/준비중상태동기화다. 실제ROS/장비·학생숙달·외부배포·PDF/EPUB는미실시다.
