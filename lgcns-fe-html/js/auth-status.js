var loginStatus = document.querySelector("[data-login-status]");
var accessToken = sessionStorage.getItem("accessToken");
var path = document.documentElement.getAttribute("data-path") || "/";

if (!loginStatus) {
  // 헤더가 없는 화면
} else if (typeof accessToken === "string" && accessToken.length > 0) {
  var button = document.createElement("button");
  button.type = "button";
  button.className = "logout-button";
  button.textContent = "로그아웃";
  button.addEventListener("click", function () {
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.textContent = "로그아웃 중...";
    sessionStorage.removeItem("accessToken");
    window.location.href = "index.html";
  });
  loginStatus.replaceChildren(button);
} else {
  var callback = path === "/login" || path === "/signup" ? "/" : path + window.location.search;
  var link = document.createElement("a");
  link.className = "login-link";
  link.href = "login.html?callbackUrl=" + encodeURIComponent(callback);
  link.textContent = "로그인";
  loginStatus.replaceChildren(link);
}
