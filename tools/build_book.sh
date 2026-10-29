#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$project_root"

metadata="book/metadata.yaml"
input_format="markdown+tex_math_single_backslash"
stylesheet="shared/style/book.css"
cover_stylesheet="shared/style/cover.css"
chapter_filter="tools/chapter_sections.lua"
cover="book/00_frontmatter/images/cover.png"
learning_path="book/00_frontmatter/images/learning_path.svg"
pdf_title_page="book/00_frontmatter/title.md"

sources=(
  book/00_frontmatter/preface.md
  book/00_frontmatter/how_to_use.md
  book/00_frontmatter/environment.md
  book/00_frontmatter/safety.md
)

append_chapter() {
  local chapter_dir="$1"
  local section_dir path

  if [[ -f "$chapter_dir/divider.md" ]]; then
    sources+=("$chapter_dir/divider.md")
  fi
  sources+=("$chapter_dir/chapter.md")
  for section_dir in labs exercises; do
    if [[ -d "$chapter_dir/$section_dir" ]]; then
      while IFS= read -r path; do
        sources+=("$path")
      done < <(
        find "$chapter_dir/$section_dir" -maxdepth 1 -type f -name '*.md' -print \
          | LC_ALL=C sort
      )
    fi
  done
}

append_chapter book/01_physical_ai_isaac_ros2
append_chapter book/02_physx_simulation
append_chapter book/03_so101_kinematics_teleop
append_chapter book/04_sensor_data_pipeline
append_chapter book/05_lerobot_smolvla
append_chapter book/06_sim2real_deployment

sources+=(
  book/appendices/migration_lyrical.md
  book/appendices/glossary.md
)

epub_sources=("${sources[@]}")
html_sources=("${sources[@]}")

fail() {
  printf '오류: %s\n' "$1" >&2
  exit 1
}

for required_tool in pandoc pdfunite find sort sed mktemp head mkdir mv rm; do
  command -v "$required_tool" >/dev/null 2>&1 \
    || fail "필수 도구를 찾을 수 없습니다: $required_tool"
done

chrome_bin="${CHROME_BIN:-}"
if [[ -n "$chrome_bin" && ! -x "$chrome_bin" ]]; then
  fail "CHROME_BIN이 실행 가능한 파일이 아닙니다: $chrome_bin"
fi

if [[ -z "$chrome_bin" ]]; then
  for candidate in google-chrome google-chrome-stable chromium chromium-browser; do
    if command -v "$candidate" >/dev/null 2>&1; then
      chrome_bin="$(command -v "$candidate")"
      break
    fi
  done
fi

if [[ -z "$chrome_bin" ]]; then
  macos_chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  if [[ -x "$macos_chrome" ]]; then
    chrome_bin="$macos_chrome"
  fi
fi

[[ -n "$chrome_bin" ]] || fail 'Chrome/Chromium을 찾을 수 없습니다. CHROME_BIN을 지정하거나 Chrome/Chromium을 설치하세요.'

required_files=("$metadata" "$stylesheet" "$cover_stylesheet" "$chapter_filter" "$cover" "$learning_path" "$pdf_title_page")
required_files+=("${sources[@]}")
for required_file in "${required_files[@]}"; do
  [[ -f "$required_file" ]] || fail "필수 입력 파일이 없습니다: $required_file"
  [[ -r "$required_file" ]] || fail "필수 입력 파일을 읽을 수 없습니다: $required_file"
done

for destination_dir in tmp output output/epub output/html output/pdf; do
  if [[ -e "$destination_dir" && ! -d "$destination_dir" ]]; then
    fail "출력 경로가 디렉터리가 아닙니다: $destination_dir"
  fi
  if [[ -d "$destination_dir" && ! -w "$destination_dir" ]]; then
    fail "출력 디렉터리에 쓸 수 없습니다: $destination_dir"
  fi
done
[[ -w "$project_root" ]] || fail "프로젝트 루트에 쓸 수 없습니다: $project_root"

resource_path=""
while IFS= read -r resource_dir; do
  resource_path+="${resource_path:+:}$resource_dir"
done < <(find book -type d -print | LC_ALL=C sort)

printf 'Pandoc: %s\n' "$(pandoc --version | sed -n '1p')"
printf 'Browser: %s (%s)\n' "$chrome_bin" "$("$chrome_bin" --version 2>/dev/null | sed -n '1p')"

mkdir -p "$project_root/tmp"
staging_dir="$(mktemp -d "$project_root/tmp/book.XXXXXX")"
cleanup() {
  rm -rf -- "$staging_dir"
}
trap cleanup EXIT INT TERM

mkdir -p "$staging_dir/epub" "$staging_dir/html" "$staging_dir/pdf"

pandoc "${epub_sources[@]}" \
  --from="$input_format" \
  --metadata-file="$metadata" \
  --lua-filter="$chapter_filter" \
  --resource-path="$resource_path" \
  --toc \
  --css="$stylesheet" \
  --epub-cover-image="$cover" \
  -o "$staging_dir/epub/physical_ai_robot_control.epub"

pandoc "${html_sources[@]}" \
  --from="$input_format" \
  --metadata-file="$metadata" \
  --lua-filter="$chapter_filter" \
  --resource-path="$resource_path" \
  --toc --standalone --embed-resources \
  --css="$stylesheet" \
  -o "$staging_dir/html/physical_ai_robot_control.html"

pandoc "$pdf_title_page" \
  --from="$input_format" \
  --metadata-file="$metadata" \
  --resource-path="$resource_path" \
  --standalone --embed-resources \
  --css="$stylesheet" \
  --css="$cover_stylesheet" \
  -o "$staging_dir/html/cover.html"

"$chrome_bin" \
  --headless=new \
  --disable-gpu \
  --no-pdf-header-footer \
  --print-to-pdf="$staging_dir/pdf/body.pdf" \
  "file://$staging_dir/html/physical_ai_robot_control.html"

"$chrome_bin" \
  --headless=new \
  --disable-gpu \
  --no-pdf-header-footer \
  --print-to-pdf="$staging_dir/pdf/cover.pdf" \
  "file://$staging_dir/html/cover.html"

pdfunite \
  "$staging_dir/pdf/cover.pdf" \
  "$staging_dir/pdf/body.pdf" \
  "$staging_dir/pdf/physical_ai_robot_control.pdf"

epub_file="$staging_dir/epub/physical_ai_robot_control.epub"
html_file="$staging_dir/html/physical_ai_robot_control.html"
pdf_file="$staging_dir/pdf/physical_ai_robot_control.pdf"

[[ -s "$epub_file" ]] || fail 'EPUB 생성 결과가 비어 있습니다.'
[[ -s "$html_file" ]] || fail 'HTML 생성 결과가 비어 있습니다.'
[[ -s "$pdf_file" ]] || fail 'PDF 생성 결과가 비어 있습니다.'
[[ "$(LC_ALL=C head -c 5 "$pdf_file")" == '%PDF-' ]] || fail 'PDF 파일 서명이 올바르지 않습니다.'

mkdir -p output/epub output/html output/pdf
mv -f "$epub_file" output/epub/physical_ai_robot_control.epub
mv -f "$html_file" output/html/physical_ai_robot_control.html
mv -f "$pdf_file" output/pdf/physical_ai_robot_control.pdf

printf 'EPUB: %s\n' "$project_root/output/epub/physical_ai_robot_control.epub"
printf 'HTML: %s\n' "$project_root/output/html/physical_ai_robot_control.html"
printf 'PDF:  %s\n' "$project_root/output/pdf/physical_ai_robot_control.pdf"

