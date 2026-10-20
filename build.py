#!/usr/bin/env python3
"""Собирает сайт из source/lesson-N.md: lesson-N.html и assets/lessons.js.

Весь контент и данные урока (название, видео, цвет, описание) лежат в одном файле
source/lesson-N.md. Нужен pandoc.
"""
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent
READER = "gfm+yaml_metadata_block+tex_math_dollars"


def pandoc(*args):
    return subprocess.run(["pandoc", *args], cwd=ROOT, check=True, capture_output=True,
                          encoding="utf-8").stdout


def number(path):
    return int(path.stem.split("-")[1])


lessons = []
for md in sorted((ROOT / "source").glob("lesson-*.md"), key=number):
    rel = md.relative_to(ROOT).as_posix()
    meta = json.loads(pandoc("-f", READER, "-t", "html", "--template=assets/lesson-meta.tpl", rel))
    n = number(md)
    html_name = f"lesson-{n}.html"
    pandoc("-f", READER, "--mathml", "--template=template.html",
           "--lua-filter=quiz.lua", rel, "-o", html_name)
    lessons.append({
        "n": n, "file": html_name, "md": rel, "title": meta["title"],
        "tone": meta.get("tone", "plum"), "desc": meta.get("desc", ""),
    })

js = "// Файл создаётся build.py из шапок source/lesson-N.md, руками не править.\n"
js += "window.LESSONS = " + json.dumps(lessons, ensure_ascii=False, indent=2) + ";\n"
(ROOT / "assets" / "lessons.js").write_text(js, encoding="utf-8", newline="\n")
print(f"Собрано уроков: {len(lessons)}")
