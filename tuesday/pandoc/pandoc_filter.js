#!/usr/bin/env node

let pandoc = require("pandoc-filter");
var Header = pandoc.Header;
var added = false;
function action(content, format, meta) {
    let { t: type, c: value } = content;
    if (!added && !!meta["title"] && (type != "Str" && type != "Space")) {
        console.error(type + " | " + JSON.stringify(value));
        added = true;

        let title = meta["title"]["c"][0]["c"];
        let index = title.indexOf("、");
        title = title.substr(index + 1);

        meta["title"]["c"][0]["c"] = title;
        return [Header(1, ["", [], []], meta["title"]["c"]), { t: type, c: value }];
    }
}

pandoc.stdio(action)
