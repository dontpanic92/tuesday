#!/bin/bash

function latest_modification {
    LATEST_DATE="19900101"
    for f in $1/*.md; do
        if [[ $f != *"short-intro"* ]]; then
            #DATE=`date -r $f "+%Y%m%d"`
            DATE=`date -d "$(git log -1 --format=%ci $f)" "+%Y%m%d"`
            if [[ $DATE -gt $LATEST_DATE ]]; then
                LATEST_DATE=$DATE
            fi
        fi
    done

    echo $LATEST_DATE
}

REVISION=`git rev-parse --short HEAD`
VERSION=`latest_modification $2`
{
    cat pandoc.md
    for f in $2/*.md; do
        if [[ $f != *"short-intro"* ]]; then
            pandoc --filter ./pandoc_filter.js -t markdown $f
            printf "\n" # insert empty line between articles
        fi
    done
}\
| pandoc -N \
--metadata title="$1" \
--metadata version="$VERSION" \
--metadata revision="$REVISION" \
--metadata original_title="$4" \
--metadata origin="$5" \
--template template.tex \
--pdf-engine=lualatex -o "$3" 
# \
# --verbose > log.txt 2>&1
