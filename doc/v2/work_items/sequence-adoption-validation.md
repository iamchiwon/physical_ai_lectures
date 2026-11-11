# 학습 순서 재배치 검증 · 2026-11-06

판정: 이번 순서 적용·개정 범위 통과. 전체 207개 교재의 집필 완료나 실제 로봇 프로젝트 수행 완료를 뜻하지 않는다. [사전 기준](sequence-adoption.md) · [독립 검토](sequence-adoption-review.md).

## 적용과 내용 검수

- 35모듈·207소주제·7경로, 학습 단계 17개에 207개를 중복 없이 배치했다. S00~S11 공통 경로는 필수 144개와 캡스톤 선택안 3개, A01~A05 전문화는 60개다. 전역 순서와 모든 경로의 allOf/anyOf 선수 조건을 검증했다.
- M01 여섯 원고와 M00.05를 코딩 가능자 대상의 환경·패키지·배열·ABI·CMake/colcon·실행 경계·시간/데이터 계약으로 개정했다. 기본 언어·문법 진단은 제거했다. 기존 9개 원고의 선수 안내도 보정했다. 총 16개 현재 지문이 독립 승인·원래 E1~E5 승인 목록과 일치한다.
- 기존 교재 사용법을 현행 순서로 재승인했다. 집필 묶음과 학습 순서를 구분하고 모바일에 팔 FK/IK 전체를 공통 필수로 요구하는 오해를 정정했다.
- 상세 교재 135개·실습 135개·문제/개별 해설 405쌍을 유지한다. 내부 상태는 ready 135 / partial 14 / tbd 58, 미완료 총 72개다. 공통 과정 중 상세 126개·미집필 21개, 전문화 중 상세 9개·미집필 51개다.
- M34 3개는 목차/계획 선수만 등록한 준비중이다. P1~P4는 목표·관련 학습·산출물·실패 판정 안내이며, 스타터·고정 환경·입력·실행 해설 패키지는 준비중이다.

## 자동 검증

- `npm test`: **127개 통과**. 최초 과거 34/204 문서 비교는 현행 문서 개정으로 실패하여 역사 A03 계약과 현행 35/207 문서 검사를 분리하고 전체 재실행했다.
- `npm run check`, `npm run lint`, `npm run build`: 모두 통과. 공유 패키지·웹 정적 생성·API Worker dry-run이며 외부 배포는 없다. 생성된 next-env.d.ts는 원래 상태로 복원했다.
- HTML 414개, 내부 링크 13,406개·자산 6,989개를 전수 검사하여 오류 0개. 모듈 35·study 207·track 7·기존 요약 18·기존 교재 읽기 137개 route를 확인했다.
- AI corpus JSON 207개와 manifest 207개를 현재 런타임 결과와 전수 대조했다. 상세 원고 자료 조각 1,350개, 모든 source SHA/evidence 일치. 기존 Resource 1,683 / Activity 731 / alias 317, 기존 ID·binding·기존 여섯 track/step 소속 및 필수/선택을 보존했다.
- 원래 교재 142파일의 공개 asset 지문과 개정 승인 16건을 확인했다. 기존 변경 book 15개/앱 1개 범위와 교육용 모형 9개 source 지문을 보존했다.
- 출판 exporter는 source 읽기·구문 검사만 했다. 단계 재등장 시 최초 모듈 anchor는 유지하고 이후 header에 첫 topic ID를 넣어 39개 header가 고유함을 확인했다. exporter/Pandoc/PDF/EPUB 실행은 없다.

## 실제 브라우저 검증

하나의 ego-browser TaskSpace 5에서 수행했다. 페이지 전수 검증은 같은 CLI 실행 안에 새 문서 error/unhandledrejection 리스너를 설치해 수행했으며 오류 목록이 실제 빈 배열임을 확인했다.

- 홈의 공통 과정 CTA를 실제 키보드로 열었다. 학습 목차의 17단계·207항목과 S01 CMake/colcon 배치, 새 프로젝트 4페이지·M34 3페이지의 준비중/실행 패키지 범위를 확인했다. 완료 항목에 준비됨 배지는 없다.
- M01.04→M01.05, M12.01→M02.01, M17.02→M17.06, M22.06→M18.05, M19.06→M18.06의 기본 이동을 확인했다. 기존 `track-mobile` URL 문맥과 다음 링크 query, M32.03의 양팔 확장 조건부 선수를 확인했다.
- 상세 교재 **135페이지**를 **320px**에서 모든 details를 펼쳐 검사했다. 답안 UI 540개·해설 540개, 본문 수식 224개와 코드 블록 34개를 실제 Markdown AST/원문과 대조했다. 준비됨 배지·KaTeX 오류·페이지 JS 오류·가로 넘침 0개다. S01도 키보드 펼치기와 실제 모바일 스크린샷으로 확인했다.
- 합성 이전 답안 8개와 이전 완료 2개를 주입해 단순 방문 후 그대로 유지되는지 확인했다. 개정 M01.04에서 이전 답안/완료 안내가 표시되고 네 답안을 새로 저장·자기검토·명시 완료했다. 재로드 후 현재 완료가 유지되고 이전 답안 4개·이전 완료가 별도 이력으로 보존되며, 미개정 M00.01 완료와 기존 v1 요약 점수 88도 유지됐다.
- M01.04 새 colcon 문단을 선택하고 실제 AI 강사 질문 흐름을 수행했다. 요청의 topic/readiness/source ID와 선택한 `package.xml`·`CMakeLists.txt` 본문이 현재 원고에서 전달됨을 확인했다. health/summary/답변은 로컬 fetch fixture이며 외부 모델의 답변 품질·ROS/GPU 실행 검증을 주장하지 않는다.
- 원래 physical-ai localStorage와 sessionStorage 값을 정확히 복원·대조한 뒤 private backup을 삭제했다. TaskSpace를 한 번 finish하고 자체 임시 서버 PID를 확인해 종료했다.

실행 로그와 JSON 근거: `/tmp/sequence-{test,check,lint,build}.log`, `sequence-static.json`, `sequence-runtime-audit.json`, `sequence-ui-browser.json`, `sequence-all135-browser.json`, `sequence-storage-browser.json`, `sequence-ai-m01-04-request.json`, `sequence-cleanup.json`. PDF/EPUB·출판 exporter·Pandoc·외부 배포·commit은 수행하지 않았다.
