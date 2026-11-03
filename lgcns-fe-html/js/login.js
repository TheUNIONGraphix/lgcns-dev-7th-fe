const loginForm = document.querySelector("#login-form");

if (loginForm) {
  const error = document.querySelector("#login-error");
  const submitButton = loginForm.querySelector("button[type='submit']");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!(loginForm instanceof HTMLFormElement) || !submitButton) return;

    const email = loginForm.email.value;
    const password = loginForm.password.value;
    if (!email || !password) return;

    submitButton.textContent = "로그인중";
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    if (error) error.textContent = "";

    try {
      const response = await fetch(`${window.apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      const accessToken = data?.data?.accessToken;
      if (!response.ok || !data.success || typeof accessToken !== "string") {
        throw new Error(data?.message || "이메일 또는 비밀번호가 올바르지 않습니다.");
      }
      sessionStorage.setItem("accessToken", accessToken);
      window.location.href = "index.html";
    } catch (caught) {
      if (error) {
        error.textContent =
          caught instanceof Error ? caught.message : "로그인 요청에 실패했습니다.";
      }
      submitButton.textContent = "로그인";
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
    }
  });
}
