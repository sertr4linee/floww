(function () {
  var els = document.querySelectorAll("[data-floww-creator]");
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    var creator = el.getAttribute("data-floww-creator");
    if (!creator) continue;

    var iframe = document.createElement("iframe");
    iframe.src =
      (el.getAttribute("data-floww-host") || "https://floww.xyz") +
      "/embed/" +
      creator;
    iframe.style.border = "none";
    iframe.style.width = el.getAttribute("data-floww-width") || "320px";
    iframe.style.height = el.getAttribute("data-floww-height") || "180px";
    iframe.style.borderRadius = "0";
    iframe.style.overflow = "hidden";
    iframe.allow = "clipboard-write";

    el.appendChild(iframe);
  }
})();
