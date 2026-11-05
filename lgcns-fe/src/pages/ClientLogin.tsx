import { type FormEvent, useState } from "react";
import { fieldLabel, primaryButton, textInput } from "../lib/ui";

function ClientLogin() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("================================================");
    console.log("userId: ", userId, "password: ", password);
    console.log("================================================");
  };

  return (
    <form
      className="mx-auto flex w-full max-w-sm flex-col gap-4 p-8"
      onSubmit={handleSubmit}
    >
      <label className={fieldLabel}>
        ID
        <input
          className={textInput}
          type="text"
          placeholder="ID"
          value={userId}
          onChange={(event) => {
            console.log(event.target.value);
            setUserId(event.target.value);
          }}
        />
      </label>
      <label className={fieldLabel}>
        Password
        <input
          className={textInput}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => {
            console.log(event.target.value);
            setPassword(event.target.value);
          }}
        />
      </label>
      <button className={primaryButton} type="submit">
        Login
      </button>
    </form>
  );
}

export default ClientLogin;
