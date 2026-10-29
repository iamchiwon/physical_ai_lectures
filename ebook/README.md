# Ebook workspace

`Physical AI 로봇 제어 실무` 교재와 이북 산출물을 관리하는 독립 작업 영역입니다.

```text
book/       교재 원고, 실습, 예제 코드, 이미지
output/     PDF, EPUB, HTML 최종 산출물
reviews/    장별·통합 검수 기록
shared/     이북용 CSS와 작성 템플릿
tools/      Pandoc 기반 빌드 스크립트
tmp/        빌드·검수 임시 자료
```

저장소 루트에서 다음과 같이 빌드합니다.

```bash
./ebook/tools/build_book.sh
```

빌드 스크립트는 스크립트 위치를 기준으로 `ebook/` 루트를 찾으므로 현재 작업 디렉터리와 무관하게 동작합니다.
