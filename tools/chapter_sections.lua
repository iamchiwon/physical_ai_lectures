-- Numbered level-2 sections such as 1.1 or 4.13 start on a fresh page.
function Header(header)
  if header.level == 2 then
    local text = pandoc.utils.stringify(header.content)
    if text:match("^%d+%.%d+") then
      header.classes:insert("chapter-section")
    end
  end
  return header
end

