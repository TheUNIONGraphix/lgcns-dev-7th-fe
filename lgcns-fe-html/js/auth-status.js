const loginStatus = document.querySelector("[data-login-status]");

if (loginStatus && sessionStorage.getItem("accessToken")) {
  loginStatus.textContent = "로그인됨";
}
