(function () {
  "use strict";

  function normalize(value) {
    return value.toLocaleLowerCase("zh-CN").replace(/\s+/g, " ").trim();
  }

  function setupSearch() {
    var form = document.querySelector(".search-form");
    var input = document.getElementById("site-search");
    var results = document.getElementById("search-results");
    var index = window.TUTORIAL_SEARCH_INDEX || [];
    if (!form || !input || !results) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = normalize(input.value);
      results.replaceChildren();
      if (!query) return;

      var root = document.documentElement.dataset.root || "";
      var matches = index.filter(function (entry) {
        return normalize(entry.title + " " + entry.part + " " + entry.text).includes(query);
      }).slice(0, 12);

      if (!matches.length) {
        var empty = document.createElement("li");
        empty.textContent = "没有找到匹配页面。";
        results.appendChild(empty);
        return;
      }

      matches.forEach(function (entry) {
        var item = document.createElement("li");
        var link = document.createElement("a");
        var part = document.createElement("small");
        link.href = root + entry.url;
        link.textContent = entry.title;
        part.textContent = entry.part;
        item.append(link, part);
        results.appendChild(item);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupSearch);
  } else {
    setupSearch();
  }
}());
