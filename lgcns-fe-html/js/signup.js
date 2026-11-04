var USER_ID_PATTERN = /^[a-z0-9_]{4,20}$/;
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var DRAFT_KEY = "lgcns-signup-draft";
var MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

function emptyDraft() {
  return { userId: "", password: "", email: "", userIdOk: false, passwordOk: false, emailOk: false, step: 1 };
}

function readDraft() {
  try {
    var parsed = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "");
    if (!parsed || typeof parsed !== "object") return emptyDraft();
    return {
      userId: typeof parsed.userId === "string" ? parsed.userId : "",
      password: typeof parsed.password === "string" ? parsed.password : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      userIdOk: parsed.userIdOk === true,
      passwordOk: parsed.passwordOk === true,
      emailOk: parsed.emailOk === true,
      step: parsed.step === 2 || parsed.step === 3 || parsed.step === 4 ? parsed.step : 1,
    };
  } catch (error) {
    return emptyDraft();
  }
}

function writeDraft(draft) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function passwordOk(value) {
  return (
    value.length >= 8 &&
    value.length <= 20 &&
    /[A-Za-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

function furthestStep(draft) {
  if (!draft.userIdOk) return 1;
  if (!draft.passwordOk) return 2;
  if (!draft.emailOk) return 3;
  return 4;
}

function requestedStep(draft) {
  var raw = new URLSearchParams(window.location.search).get("step");
  var parsed = raw === null ? draft.step : Number(raw);
  return parsed === 2 || parsed === 3 || parsed === 4 ? parsed : 1;
}

var signup = document.querySelector("#signup");

if (signup) {
  var draft = readDraft();
  var maxStep = furthestStep(draft);
  var step = requestedStep(draft);
  if (step > maxStep) step = maxStep;
  if (new URLSearchParams(window.location.search).get("step") !== String(step)) {
    history.replaceState(null, "", "signup.html?step=" + step);
  }

  var steps = signup.querySelectorAll("[data-step]");
  var bars = signup.querySelectorAll("[data-step-bar]");
  var labels = signup.querySelectorAll("[data-step-label]");
  var userIdInput = signup.querySelector("#userId");
  var passwordInput = signup.querySelector("#password");
  var confirmInput = signup.querySelector("#passwordConfirm");
  var emailInput = signup.querySelector("#email");
  var photoInput = signup.querySelector("#profileImage");
  var formError = signup.querySelector("#signup-error");

  userIdInput.value = draft.userId;
  passwordInput.value = draft.password;
  confirmInput.value = draft.password;
  emailInput.value = draft.email;

  function show(nextStep) {
    step = nextStep;
    draft.step = step;
    writeDraft(draft);
    history.replaceState(null, "", "signup.html?step=" + step);
    steps.forEach(function (panel) {
      panel.hidden = Number(panel.getAttribute("data-step")) !== step;
    });
    labels.forEach(function (label) {
      var id = Number(label.getAttribute("data-step-label"));
      label.classList.toggle("is-active", id <= step);
    });
    bars.forEach(function (bar) {
      bar.classList.toggle("is-active", Number(bar.getAttribute("data-step-bar")) <= step);
    });
    formError.textContent = "";
  }

  function setBusy(button, pendingLabel) {
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.dataset.label = button.textContent;
    button.textContent = pendingLabel;
  }

  function clearBusy(button) {
    button.disabled = false;
    button.removeAttribute("aria-busy");
    if (button.dataset.label) button.textContent = button.dataset.label;
  }

  show(step);

  signup.querySelector("[data-next='1']").addEventListener("click", function () {
    var value = userIdInput.value.trim();
    if (!USER_ID_PATTERN.test(value)) {
      formError.textContent = "영문 소문자, 숫자, 밑줄(_)을 조합해 4~20자로 입력해주세요.";
      return;
    }
    draft.userId = value;
    draft.userIdOk = true;
    writeDraft(draft);
    show(2);
  });

  signup.querySelector("[data-next='2']").addEventListener("click", function () {
    if (!passwordOk(passwordInput.value)) {
      formError.textContent = "영문, 숫자, 특수문자를 포함한 8~20자로 입력해 주세요.";
      return;
    }
    if (passwordInput.value !== confirmInput.value) {
      formError.textContent = "비밀번호가 일치하지 않아요.";
      return;
    }
    draft.password = passwordInput.value;
    draft.passwordOk = true;
    writeDraft(draft);
    show(3);
  });

  signup.querySelector("[data-next='3']").addEventListener("click", function () {
    var value = emailInput.value.trim();
    if (!value) {
      formError.textContent = "이메일을 입력해 주세요.";
      return;
    }
    if (!EMAIL_PATTERN.test(value)) {
      formError.textContent = "이메일을 확인해 주세요.";
      return;
    }
    draft.email = value;
    draft.emailOk = true;
    writeDraft(draft);
    show(4);
  });

  signup.querySelectorAll("[data-back]").forEach(function (button) {
    button.addEventListener("click", function () {
      show(Number(button.getAttribute("data-back")));
    });
  });

  signup.querySelectorAll("[data-password-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      var input = signup.querySelector("#" + button.getAttribute("data-password-toggle"));
      var visible = input.type === "text";
      input.type = visible ? "password" : "text";
      button.setAttribute("aria-pressed", String(!visible));
      button.setAttribute("aria-label", visible ? "비밀번호 보기" : "비밀번호 숨기기");
    });
  });

  async function finish(includePhoto, button) {
    setBusy(button, "가입 중");
    formError.textContent = "";
    var profileImageUrl;
    var file = includePhoto ? photoInput.files && photoInput.files[0] : null;
    if (file) {
      if (file.type !== "image/png" && file.type !== "image/jpeg") {
        formError.textContent = "JPG, PNG 이미지만 등록할 수 있습니다.";
        clearBusy(button);
        return;
      }
      if (file.size > MAX_PROFILE_IMAGE_BYTES) {
        formError.textContent = "프로필 사진은 5MB 이하로 등록해 주세요.";
        clearBusy(button);
        return;
      }
      profileImageUrl = await new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve(String(reader.result || "")); };
        reader.onerror = function () { reject(new Error("프로필 사진을 읽지 못했습니다.")); };
        reader.readAsDataURL(file);
      }).catch(function (error) {
        formError.textContent = error.message;
        return "";
      });
      if (!profileImageUrl) {
        clearBusy(button);
        return;
      }
    }

    try {
      var response = await fetch(window.apiBaseUrl + "/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: draft.userId,
          email: draft.email,
          password: draft.password,
          interests: [],
          profileImageUrl: profileImageUrl,
        }),
      });
      var data = await response.json();
      if (!response.ok || !data.success) {
        var message = (data && data.message) || "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.";
        if (message.indexOf("아이디") !== -1) {
          draft.userIdOk = false;
          writeDraft(draft);
          show(1);
        } else if (message.indexOf("이메일") !== -1) {
          draft.emailOk = false;
          writeDraft(draft);
          show(3);
        }
        formError.textContent = message;
        clearBusy(button);
        return;
      }
      sessionStorage.removeItem(DRAFT_KEY);
      window.location.href = "login.html";
    } catch (error) {
      formError.textContent = "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.";
      clearBusy(button);
    }
  }

  signup.querySelector("[data-finish]").addEventListener("click", function (event) {
    finish(true, event.currentTarget);
  });
  signup.querySelector("[data-skip]").addEventListener("click", function (event) {
    finish(false, event.currentTarget);
  });
}
