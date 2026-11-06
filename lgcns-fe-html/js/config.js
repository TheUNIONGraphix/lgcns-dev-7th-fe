(function () {
  var hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  var token = hash.get("accessToken");
  if (!token) return;
  sessionStorage.setItem("accessToken", token);
  hash.delete("accessToken");
  var nextHash = hash.toString();
  history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search + (nextHash ? "#" + nextHash : ""),
  );
})();

window.APP_ENV = "local";

window.API_BASE = {
  local: "http://localhost:3000",
  develop: "http://localhost:3000",
};

window.authOrigin = window.API_BASE[window.APP_ENV] || window.API_BASE.local;
window.apiBaseUrl = window.location.protocol === "file:" ? window.authOrigin : "";

window.withoutAuthUrlList = ["/login", "/signup"];
window.authUrlList = ["/cart", "/order"];
window.authPrefixList = ["/postwrite"];

window.safeCallbackPath = function safeCallbackPath(value) {
  if (!value || value.charAt(0) !== "/" || value.indexOf("//") === 0) return "/";
  var pathname = value.split("?")[0];
  if (window.withoutAuthUrlList.indexOf(pathname) !== -1) return "/";
  return value;
};

window.pageHref = function pageHref(pathWithQuery) {
  var safe = window.safeCallbackPath(pathWithQuery);
  var queryIndex = safe.indexOf("?");
  var pathname = queryIndex === -1 ? safe : safe.slice(0, queryIndex);
  var query = queryIndex === -1 ? "" : safe.slice(queryIndex);
  var files = {
    "/": "index.html",
    "/about": "about.html",
    "/contact": "contact.html",
    "/login": "login.html",
    "/signup": "signup.html",
    "/cart": "cart.html",
    "/order": "order.html",
    "/feed": "feed.html",
    "/client-login": "client-login.html",
    "/posts": "posts.html",
    "/postwrite": "postwrite.html",
  };

  if (pathname.indexOf("/postdetail/") === 0) {
    var postQuery = "postId=" + encodeURIComponent(pathname.slice("/postdetail/".length));
    return "postdetail.html?" + postQuery + (query ? "&" + query.slice(1) : "");
  }

  if (pathname.indexOf("/blog/") === 0) {
    var blogQuery = "blogId=" + encodeURIComponent(pathname.slice("/blog/".length));
    return "blog.html?" + blogQuery + (query ? "&" + query.slice(1) : "");
  }
  if (pathname.indexOf("/product/") === 0) {
    var categoryQuery = "category=" + encodeURIComponent(pathname.slice("/product/".length));
    return "product.html?" + categoryQuery + (query ? "&" + query.slice(1) : "");
  }
  return (files[pathname] || "index.html") + query;
};
