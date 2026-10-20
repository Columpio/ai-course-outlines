#!/bin/sh
# Пересобирает lesson-N.html из source/lesson-N.md
cd "$(dirname "$0")"
for f in source/lesson-*.md; do
  n=$(basename "$f" .md)
  pandoc -f gfm+tex_math_dollars --mathml --template=template.html \
    -M pagetitle="$(head -1 "$f" | sed 's/^# //')" "$f" -o "$n.html"
done
