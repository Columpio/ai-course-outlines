#!/bin/sh
# Пересобирает lesson-N.html из source/lesson-N.md
cd "$(dirname "$0")"
for f in source/lesson-*.md; do
  n=$(basename "$f" .md)
  case "$n" in
    lesson-1) video=3b563ee866978191664fb56d6d3b9af5 ;;
    lesson-2) video=766006cf920a1fd160e3d553417258a2 ;;
    *) video= ;;
  esac
  pandoc -f gfm+tex_math_dollars --mathml --template=template.html \
    -M videoid="$video" -M pagetitle="$(head -1 "$f" | sed 's/^# //')" "$f" -o "$n.html"
done
