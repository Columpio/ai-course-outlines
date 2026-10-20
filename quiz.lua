-- Превращает блок «Группа 1» (вопросы + список ответов под спойлером) в интерактивный тест.
-- Правильные ответы берутся из нумерованного списка внутри <details> и пишутся в data-answer.

local function html(inlines)
  local out = pandoc.write(pandoc.Pandoc({ pandoc.Plain(inlines) }), "html")
  return (out:gsub("%s+$", ""))
end

local function is_quiz_heading(b)
  return b.t == "Header" and b.level == 3 and pandoc.utils.stringify(b):find("Группа 1", 1, true)
end

local function build_question(number, title_block, options_list, answer)
  local parts = {}
  parts[#parts + 1] = string.format('<div class="quiz-q" data-answer="%s">', answer)
  parts[#parts + 1] = "<p>" .. html(title_block.content) .. "</p>"
  parts[#parts + 1] = '<ul class="quiz-options">'
  for _, item in ipairs(options_list.content) do
    local inlines = item[1].content
    local letter = ""
    local first = inlines[1]
    if first and first.t == "Str" and first.text:match("^[A-D]%)$") then
      letter = first.text:sub(1, 1)
      table.remove(inlines, 1)
      if inlines[1] and inlines[1].t == "Space" then table.remove(inlines, 1) end
    end
    parts[#parts + 1] = string.format(
      '<li><button type="button" class="quiz-opt" data-letter="%s"><span class="letter">%s</span><span>%s</span></button></li>',
      letter, letter, html(inlines))
  end
  parts[#parts + 1] = '</ul><p class="quiz-feedback" aria-live="polite"></p></div>'
  return pandoc.RawBlock("html", table.concat(parts, "\n"))
end

function Pandoc(doc)
  local out = {}
  local blocks = doc.blocks
  local dropped_h1 = false
  local i = 1
  while i <= #blocks do
    local b = blocks[i]
    if b.t == "Header" and b.level == 1 and not dropped_h1 then
      dropped_h1 = true -- заголовок выводится баннером из шапки файла
      i = i + 1
    elseif is_quiz_heading(b) then
      out[#out + 1] = b
      local questions, answers = {}, {}
      local j = i + 1
      while j <= #blocks do
        local c = blocks[j]
        if (c.t == "Header" and c.level <= 3) or c.t == "HorizontalRule" then break end
        if c.t == "Para" and c.content[1] and c.content[1].t == "Strong"
            and blocks[j + 1] and blocks[j + 1].t == "BulletList" then
          questions[#questions + 1] = { c, blocks[j + 1] }
          j = j + 1
        elseif c.t == "OrderedList" then
          for _, item in ipairs(c.content) do
            answers[#answers + 1] = pandoc.utils.stringify(item[1]):sub(1, 1)
          end
        end
        j = j + 1
      end
      for n, q in ipairs(questions) do
        out[#out + 1] = build_question(n, q[1], q[2], answers[n] or "")
      end
      i = j
    else
      out[#out + 1] = b
      i = i + 1
    end
  end
  doc.blocks = out
  return doc
end
