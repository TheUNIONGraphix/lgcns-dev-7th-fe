var SAVED_USER_ID_KEY = "lgcns-saved-user-id";
var loginForm = document.querySelector("#login-form");

function readSavedUserId() {
  return window.localStorage.getItem(SAVED_USER_ID_KEY) || "";
}

function fieldMessage(name, value) {
  if (value) return "";
  return name === "userId" ? "아이디를 입력해 주세요." : "비밀번호를 입력해 주세요.";
}

function startProvider(provider, callbackUrl) {
  var returnTo = new URL(window.pageHref(callbackUrl), window.location.href).href;
  var handoff = "/api/auth/handoff?returnTo=" + encodeURIComponent(returnTo);
  window.location.href =
    window.authOrigin +
    "/api/auth/signin/" +
    provider +
    "?callbackUrl=" +
    encodeURIComponent(handoff);
}

if (loginForm) {
  var params = new URLSearchParams(window.location.search);
  var callbackUrl = window.safeCallbackPath(params.get("callbackUrl"));
  var userIdInput = loginForm.querySelector("#userId");
  var passwordInput = loginForm.querySelector("#password");
  var rememberInput = loginForm.querySelector("#remember-id");
  var userIdError = document.querySelector("#userId-error");
  var passwordError = document.querySelector("#password-error");
  var formError = document.querySelector("#login-error");
  var submitButton = loginForm.querySelector("button[type='submit']");
  var toggleButton = loginForm.querySelector("[data-password-toggle]");
  var savedUserId = readSavedUserId();

  userIdInput.value = savedUserId;
  rememberInput.checked = savedUserId.length > 0;

  toggleButton.addEventListener("click", function () {
    var visible = passwordInput.type === "text";
    passwordInput.type = visible ? "password" : "text";
    toggleButton.setAttribute("aria-pressed", String(!visible));
    toggleButton.setAttribute("aria-label", visible ? "비밀번호 보기" : "비밀번호 숨기기");
    toggleButton.textContent = visible ? "보기" : "숨기기";
  });

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    var userId = userIdInput.value;
    var password = passwordInput.value;
    var userMessage = fieldMessage("userId", userId);
    var passwordMessage = fieldMessage("password", password);
    userIdError.textContent = userMessage;
    passwordError.textContent = passwordMessage;
    if (userMessage || passwordMessage) return;

    if (rememberInput.checked) window.localStorage.setItem(SAVED_USER_ID_KEY, userId);
    else window.localStorage.removeItem(SAVED_USER_ID_KEY);

    formError.textContent = "";
    submitButton.textContent = "로그인 중...";
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");

    try {
      var response = await fetch(window.apiBaseUrl + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userId, password: password }),
      });
      var data = await response.json();
      var accessToken = data && data.data && data.data.accessToken;
      if (!response.ok || !data.success || typeof accessToken !== "string") {
        throw new Error((data && data.message) || "아이디 또는 비밀번호가 올바르지 않습니다.");
      }
      sessionStorage.setItem("accessToken", accessToken);
      window.location.href = window.pageHref(callbackUrl);
    } catch (caught) {
      formError.textContent = caught instanceof Error ? caught.message : "로그인 요청에 실패했습니다.";
      submitButton.textContent = "로그인";
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
    }
  });

  document.querySelector("[data-provider='google']").addEventListener("click", function () {
    startProvider("google", callbackUrl);
  });
  document.querySelector("[data-provider='kakao']").addEventListener("click", function () {
    startProvider("kakao", callbackUrl);
  });
}
