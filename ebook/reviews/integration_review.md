# Physical AI 로봇 제어 실무 통합 검수 보고서

- 검수일: 2026-10-28
- 검수 범위: `ebook/book/` 전체, `ebook/shared/style/book.css`, `ebook/tools/build_book.sh`
- 제약: EPUB/PDF 산출물은 생성하지 않았다. Pandoc HTML 변환은 표준 출력으로만 검사했다.
- 종합 판정: **BLOCKED** - 아래 Blocker 3건을 수정하기 전에는 최종 EPUB/PDF를 배포하면 안 된다.

## 1. 검수 결과 요약

| 심각도 | 건수 | 요약 |
|---|---:|---|
| Blocker | 3 | Linux PDF 빌드 불가, 장 번호/표제 중복, 실습·연습문제 누락과 깨진 전자책 링크 |
| Major | 4 | PDF 표지/학습 경로 누락, ROS 2 Python 패키지 메타데이터, 비원자적 빌드, 최종 렌더 검증 부재 |
| Minor | 5 | 캐시/OS 파일, 참고문헌 자동화 불일치, 사용하지 않는 경로, 축약 코드 경로, 하위 제목 번호 스타일 |

## 2. Blocker

### B-01. Ubuntu 24.04 기준인데 PDF 빌드가 macOS 전용이다

**근거**

- `ebook/tools/build_book.sh:49`가 Chrome을 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`으로 고정한다.
- `ebook/tools/build_book.sh:50-53`은 이 경로가 없으면 종료한다.
- 교재 기준 환경은 `ebook/book/00_frontmatter/environment.md:7-10`의 Ubuntu 24.04 LTS, ROS 2 Jazzy다.

**영향**

Ubuntu 24.04의 정상적인 `google-chrome`, `chromium`, `chromium-browser` 설치를 찾지 못하므로 EPUB/HTML 생성 후 PDF 단계가 반드시 실패한다.

**수정 권고**

1. `CHROME_BIN` 환경변수를 최우선으로 허용한다.
2. 없으면 `command -v google-chrome`, `google-chrome-stable`, `chromium`, `chromium-browser` 순으로 탐색한다.
3. macOS 경로는 마지막 fallback으로만 둔다.
4. 선택한 실행 파일과 버전을 빌드 로그에 출력한다.
5. 최종 기준 환경인 Ubuntu 24.04에서 실제 PDF 빌드와 렌더 검수를 수행한다.

### B-02. 표제가 중복되고 모든 장 번호가 6부터 시작한다

**근거**

- `ebook/book/metadata.yaml:2-8`에 title과 `number-sections: true`가 있다.
- `ebook/book/00_frontmatter/title.md:1-8`에도 같은 YAML title과 명시적 `# Physical AI 로봇 제어 실무`가 있다.
- `ebook/tools/build_book.sh:37,45`가 다시 `--number-sections`를 지정한다.
- 앞부분의 `머리말`, `이 책의 사용법`, `기준 실습 환경`, `안전 수칙`도 H1이다.
- 각 장 제목과 절 제목에는 이미 `제1장`, `1.1`처럼 수동 번호가 들어 있다.

**읽기 전용 Pandoc 검사 결과**

- metadata title block 뒤에 본문의 같은 title H1이 한 번 더 생성됐다.
- 앞부분 H1이 1~5로 번호 매겨졌다.
- 실제 제1~6장은 Pandoc 번호 6~11로 출력됐다.
- 부록 A/B는 Pandoc 번호 12/13으로 출력됐다.
- 수동 번호와 자동 번호가 동시에 보이므로 `6 제1장 ...`, `6.1 1.1 ...` 형태가 된다.

**수정 권고**

현재 원고가 이미 수동 번호를 완성했으므로 가장 작은 수정은 다음과 같다.

1. `ebook/book/metadata.yaml`의 `number-sections: true`를 제거한다.
2. 두 Pandoc 호출에서 `--number-sections`를 제거한다.
3. title metadata는 `ebook/book/metadata.yaml` 한 곳만 권위 원본으로 둔다.
4. `title.md`는 sources에서 빼고 Pandoc title block을 사용하거나, 별도 템플릿으로 표지/표제지를 만들되 동일 제목 H1을 중복 생성하지 않는다.
5. 수정 후 HTML AST에서 실제 장 제목이 정확히 제1~6장, 부록 A/B인지 확인한다.

### B-03. 장별 실습·연습문제가 전자책에서 빠지고 링크가 깨진다

**근거**

- 저장소에는 실습 21개와 연습/해설 8개, 총 29개 Markdown 파일이 있다.
- `ebook/tools/build_book.sh:9-23`의 sources에는 앞부분, `chapter.md` 6개, 부록 2개만 있다.
- 제2·3·5·6장 본문에는 `labs/*.md`, `exercises/*.md` 링크 22개가 있다.
- Pandoc HTML 표준 출력에서 이 링크들은 `href="labs/...md"`, `href="exercises/...md"`로 그대로 남았다.
- 해당 Markdown은 EPUB/HTML에 복사되지 않으므로 완성 전자책에서 링크 대상이 없다.
- 제1·4장의 실습/해설도 sources에 없고 본문에서 파일 링크조차 만들지 않아 전자책에서 완전히 누락된다.

**영향**

사용자가 요청한 장별 실습, 코드 활용 지시, 문제 해설, 프로젝트 평가표가 최종 교과서에 포함되지 않는다. 저장소에서는 상대 경로가 존재하지만 EPUB/PDF 패키징 관점에서는 깨진 링크다.

**수정 권고**

1. 각 장 다음에 그 장의 `labs/*.md`와 `exercises/*.md`를 명시적 순서로 sources에 포함한다.
2. 실습/연습 파일의 첫 제목을 전자책 구조에 맞는 H2/H3로 조정하고 명시적 ID를 부여한다. 예: `## 실습 3-1 ... {#lab-3-1}`.
3. 본문 링크를 `.md` 파일 링크가 아니라 `(#lab-3-1)` 같은 내부 앵커로 교체한다.
4. 제1·4장에도 실습/해설로 가는 내부 링크와 포함 순서를 추가한다.
5. 빌드 후 EPUB 압축 내부와 HTML에서 `.md`로 끝나는 href가 0개인지 검사한다.

## 3. Major

### M-01. PDF에는 표지 이미지와 학습 경로 도식이 포함되지 않는다

**근거**

- `ebook/tools/build_book.sh:39`의 `--epub-cover-image`는 EPUB 호출에만 있다.
- HTML/PDF 경로에는 `ebook/book/00_frontmatter/images/cover.png`를 포함하는 본문이나 템플릿이 없다.
- `ebook/book/00_frontmatter/README.md:9`는 `learning_path.svg` 사용을 약속하지만 실제 sources의 어느 문서도 이를 참조하지 않는다.

**수정 권고**

- PDF용 HTML 템플릿 또는 전용 cover/title source를 만들어 cover를 첫 페이지에 배치한다.
- `how_to_use.md`의 학습 경로 절에 `images/learning_path.svg`를 삽입한다.
- EPUB cover와 본문 첫 표제지의 중복 표시 여부를 reader에서 확인한다.

### M-02. ROS 2 `ament_python` 패키지 두 개에 build tool 의존성이 없다

**근거**

- `ebook/book/01_physical_ai_isaac_ros2/code/ros2_jazzy/physical_ai_demo/package.xml`은 `ament_python` build type을 export하지만 `<buildtool_depend>ament_python</buildtool_depend>`가 없다.
- `ebook/book/04_sensor_data_pipeline/code/ros2_jazzy/sensor_pipeline/package.xml`도 동일하다.
- 제6장 `sim2real_safety/package.xml`은 이 의존성을 올바르게 선언하고 있어 비교 기준이 된다.

**영향**

일부 개발 환경에서는 이미 설치된 colcon plugin 덕분에 빌드될 수 있지만, `rosdep` 및 깨끗한 ROS 2 Jazzy 환경의 패키지 메타데이터가 불완전하다.

**수정 권고**

두 package.xml에 다음을 추가하고 Ubuntu 24.04 + ROS 2 Jazzy의 깨끗한 workspace에서 `rosdep install`과 `colcon build`를 실행한다.

```xml
<buildtool_depend>ament_python</buildtool_depend>
```

### M-03. 빌드가 사전 점검 없이 최종 경로에 부분 산출물을 남긴다

**근거**

- `ebook/tools/build_book.sh:7`에서 바로 최종 출력 디렉터리를 만든다.
- Pandoc/Chrome/입력 이미지/CSS의 존재와 버전을 모두 확인하기 전에 EPUB과 HTML을 최종 경로에 기록한다.
- B-01의 Chrome 실패가 나면 EPUB과 HTML은 남고 PDF만 없다.

**수정 권고**

- 첫 mutation 전에 `pandoc`, Chrome/Chromium, CSS, cover, 모든 source/resource를 검사한다.
- `tmp/ebook/book/` 아래에 EPUB/HTML/PDF를 만든 뒤 세 산출물이 모두 검증된 경우에만 `ebook/output/`으로 이동한다.
- 실패 시 어떤 산출물이 유효하지 않은지 명확히 출력한다.

### M-04. 최종 EPUB/PDF 렌더 품질은 아직 검증되지 않았다

**근거**

- 요청에 따라 이번 검수에서는 EPUB/PDF를 생성하지 않았다.
- Markdown→HTML 파싱과 MathML 생성은 성공했지만 페이지 나눔, 표 넘침, SVG 한글 폰트, 코드 블록 잘림, EPUB reader 호환성은 확인할 수 없다.
- CSS의 `@bottom-center` margin box와 `break-inside` 동작은 실제 Chrome 버전 및 EPUB reader에 의존한다.

**수정 권고**

- Blocker 수정 후 실제 EPUB/PDF를 생성한다.
- EPUB은 최소 두 reader에서 목차, MathML, SVG, 내부 링크를 확인한다.
- PDF는 전 페이지를 PNG로 렌더해 표/코드/수식/그림/페이지 번호/장 전환을 검사한다.
- PDF 텍스트 추출로 한글 누락과 폰트 대체 문제도 점검한다.

## 4. Minor

### m-01. 불필요한 OS/런타임 산출물이 있다

현재 확인된 항목은 `.DS_Store`, `ebook/book/.DS_Store`, `ebook/book/00_frontmatter/.DS_Store`, `ebook/book/01_physical_ai_isaac_ros2/.DS_Store`다. 검수 도중 보였던 제5·6장 `__pycache__/`와 `.pyc`는 최종 재검 시점에는 정리되어 있었다.

**권고:** 남은 `.DS_Store`를 최종 패키징 전에 삭제하고 `.gitignore`에 `.DS_Store`, `__pycache__/`, `*.pyc`, 장별 `.venv/`, ROS `build/ install/ log/`를 추가한다.

### m-02. 참고문헌 메타데이터와 실제 인용 방식이 일치하지 않는다

- `ebook/book/metadata.yaml:9`는 `link-citations: true`지만 bibliography 파일과 `--citeproc`가 없다.
- 실제 원고는 수동 Markdown 링크와 `[저자, 연도]` 텍스트를 사용한다.
- `ebook/book/references/README.md`는 통합 시 중복 정리를 예고하지만 아직 placeholder다.

**권고:** 수동 장별 참고문헌을 유지한다면 `link-citations`를 제거하고 중복 URL/서지 형식을 편집 검수한다. 자동 인용을 원하면 BibTeX/CSL 또는 YAML bibliography와 `--citeproc`를 도입한다.

### m-03. `ebook/tmp/book`가 생성되지만 사용되지 않는다

`ebook/tools/build_book.sh:7`이 `ebook/tmp/book`을 만들지만 이후 모든 출력은 곧바로 `ebook/output/`에 기록된다. M-03의 원자적 빌드 임시 경로로 실제 사용하거나 제거한다.

### m-04. 한 코드 경로가 축약되어 복사할 수 없다

`ebook/book/06_sim2real_deployment/chapter.md`에는 ``code/ros2_ws/.../workspace_guard.py``가 나온다. 실제 경로는 `code/ros2_ws/src/sim2real_safety/sim2real_safety/workspace_guard.py`다. 독자가 검색할 수 있도록 정확한 경로로 바꾼다.

### m-05. 일부 하위 제목은 수동 절 번호 스타일이 혼재한다

예를 들어 제6장 `6.8 포트폴리오 패키징` 아래의 `### 필수 구조`, `### 보고할 결과`는 다른 절의 `6.x.y` 스타일과 다르다. 자동 번호를 끌 경우 이 차이가 그대로 보인다. 모든 H3를 수동 번호로 통일하거나, 번호 없는 설명용 소제목이라는 편집 규칙을 명시한다.

## 5. 통과한 검사

### 문서와 링크

- Markdown 48개 검사
- 로컬 이미지 참조 22개: 저장소 기준 모두 존재
- 로컬 Markdown 링크 22개: 저장소 기준 모두 존재
- 외부 Markdown 링크 101개, 고유 URL 78개: 공백이 포함된 명백한 형식 오류 없음
- 6개 `chapter.md`의 H1 장 번호와 H2 수동 장 번호가 각각 1~6장과 일치
- Pandoc HTML 표준 출력에서 복잡한 수식이 MathML로 변환됨

주의: 로컬 파일이 존재한다는 검사는 통과했지만, B-03처럼 전자책에 그 파일이 포함된다는 뜻은 아니다.

### 코드와 자산

- Python 32개: `ast.parse` 구문 검사 통과
- XML 5개 및 SVG 23개: XML parser 검사 통과
- `ebook/book/04_sensor_data_pipeline/code/interpolate_joint_state.cpp`: C++17 `-fsyntax-only` 통과
- `ebook/tools/build_book.sh`: `bash -n` 통과, 실행 비트 확인
- 표지 PNG: 1024×1536 RGB, 정상 판독
- 모든 장의 본문에서 명시한 실제 `code/` 파일은 존재함. 제6장의 축약 표기 1건은 m-04로 분류

ROS 2 C++/Python 패키지와 Isaac Sim/LeRobot 코드는 현재 macOS 검수 호스트에 Jazzy/Isaac Sim이 없어 실제 빌드·실행하지 않았다.

### 버전 일관성

- 주 환경은 Ubuntu 24.04 LTS + ROS 2 Jazzy로 일관된다.
- `/opt/ros/jazzy` 예제가 사용된다.
- Ubuntu 22.04 언급은 Isaac Sim이 지원하는 다른 플랫폼 설명 1건이며 실행 기준 변경이 아니다.
- ROS 2 Lyrical/Ubuntu 26.04 언급은 머리말과 마이그레이션 부록으로 격리되어 있다.
- SO-101은 앞부분에서 `5-DoF 팔 + 그리퍼, 총 6개 구동기`로 정리되어 제3장 설명과 일치한다.

## 6. 수정 우선순위

1. B-03: 실습/연습문제를 sources에 포함하고 링크를 내부 앵커로 변경
2. B-02: 자동 번호와 중복 표제 제거
3. B-01: Ubuntu용 Chrome 탐색 및 PDF 빌드 경로 수정
4. M-01: PDF 표지와 학습 경로 도식 포함
5. M-02: ROS 2 Python package.xml 보완
6. M-03: 사전 점검 및 원자적 출력
7. 캐시 정리 후 실제 EPUB/PDF 생성·렌더 검수

