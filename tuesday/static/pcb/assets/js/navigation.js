(function () {
  "use strict";
  document.documentElement.classList.add("js");

  function setupNavigation() {
    var button = document.querySelector(".nav-toggle");
    var navigation = document.getElementById("site-navigation");
    if (!button || !navigation) return;

    if (window.matchMedia("(max-width: 52rem)").matches) {
      navigation.dataset.collapsed = "true";
    }

    button.addEventListener("click", function () {
      var collapsed = navigation.dataset.collapsed === "true";
      navigation.dataset.collapsed = collapsed ? "false" : "true";
      button.setAttribute("aria-expanded", collapsed ? "true" : "false");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupNavigation);
  } else {
    setupNavigation();
  }
}());
