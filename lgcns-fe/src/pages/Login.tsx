import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest, saveAccessToken } from "../lib/auth";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || !email || !password) return;

    setPending(true);
    setFormError("");
    try {
      const result = await loginRequest(email, password);
      if (!result.ok) {
        setFormError(result.message);
        setPending(false);
        return;
      }
      saveAccessToken(result.accessToken);
      navigate("/");
    } catch {
      setFormError("로그인 요청에 실패했습니다.");
      setPending(false);
    }
  };

  return (
    <section className="page">
      <h1>Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          이메일
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <p role="alert">{formError}</p>
        <button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? "로그인중" : "로그인"}
        </button>
      </form>
    </section>
  );
}

export default Login;
