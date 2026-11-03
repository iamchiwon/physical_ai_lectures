-- Resolve learning-site links only in Pandoc Link nodes, never inside code examples.
-- Collect the complete book's anchors first so a partial export cannot invent targets.
function Pandoc(doc)
  local anchors = {}
  local legacy = {}
  local module_chapter = 0
  local by_title = {}
  local function title_key(chapter, title)
    return tostring(math.floor(tonumber(chapter))) .. '\0' .. title
  end
  local map_meta = doc.meta['book-link-map']
  if map_meta then
    local file = assert(io.open(pandoc.utils.stringify(map_meta), 'r'))
    local data = pandoc.json.decode(file:read('*a'))
    file:close()
    for _, item in ipairs(data) do
      local key = title_key(item.chapter, item.title)
      by_title[key] = by_title[key] or {}
      table.insert(by_title[key], item.url)
    end
  end
  doc = doc:walk({ Header = function(header)
    if header.identifier ~= '' then anchors[header.identifier] = true end
    local text = pandoc.utils.stringify(header.content)
    if header.level == 1 then
      local number = text:match('^제(%d+)장')
      if number then module_chapter = tonumber(number)
      elseif text:match('^E%d+ ') or text:match('^M%d%d%.') then module_chapter = nil end
    end
    if module_chapter ~= nil then
      local urls = by_title[title_key(module_chapter, text)]
      if urls and header.identifier ~= '' then
        for _, url in ipairs(urls) do legacy[url] = legacy[url] or header.identifier end
      end
    end
    if header.level == 2 and text:match('^%d+%.%d+') then
      header.classes:insert('chapter-section')
    end
    return header
  end })
  local base = doc.meta['book-web-base-url'] and pandoc.utils.stringify(doc.meta['book-web-base-url'])
    or 'https://physical-ai-learning-web.pages.dev'
  assert(base:match('^https?://[^/]+'), 'BOOK_WEB_BASE_URL must be an absolute HTTP(S) origin or base URL')
  base = base:gsub('/+$', '')
  doc = doc:walk({ Link = function(link)
    if not link.target:match('^/') then return nil end
    -- Interactive controls are web-only; a unit heading cannot replace their target.
    if link.target:match('^/study/[^#]+#control%-concept%-lab$') or link.target:match('^/study/[^#]+#wheel%-concept%-lab$') then
      link.target = base .. link.target
      return link
    end
    local pathname = link.target:match('^[^?#]+')
    local module, number = pathname:match('^/study/unit%-(m%d%d)%-(%d%d)%-a/$')
    local local_id = module and (module .. '-' .. number) or nil
    local foundation = pathname:match('^/modules/(M%d%d)/$')
    if foundation then local_id = foundation:lower() end
    local_id = local_id or legacy[pathname]
    link.target = local_id and anchors[local_id] and ('#' .. local_id) or (base .. link.target)
    return link
  end })
  doc.meta['book-link-map'] = nil
  doc.meta['book-web-base-url'] = nil
  return doc
end
