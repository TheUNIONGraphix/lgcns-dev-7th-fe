var loginStatus = document.querySelector("[data-login-status]");
var accessToken = sessionStorage.getItem("accessToken");

if (loginStatus && typeof accessToken === "string" && accessToken.length > 0) {
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
}
