(function () {
  var path = document.documentElement.getAttribute("data-path");
  if (!path) return;

  var token = sessionStorage.getItem("accessToken");
  var loggedIn = typeof token === "string" && token.length > 0;
  var params = new URLSearchParams(window.location.search);

  if (window.withoutAuthUrlList.indexOf(path) !== -1) {
    if (!loggedIn) return;
    window.location.replace(window.pageHref(window.safeCallbackPath(params.get("callbackUrl"))));
    return;
  }

  if (window.authUrlList.indexOf(path) !== -1 && !loggedIn) {
    var callback = path + window.location.search;
    window.location.replace("login.html?callbackUrl=" + encodeURIComponent(callback));
  }
})();
