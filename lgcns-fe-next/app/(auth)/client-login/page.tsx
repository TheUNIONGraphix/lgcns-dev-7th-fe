'use client'

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ClientLogin() {

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setUserId(e.target.value);
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("================================================");
    console.log("userId: ", userId, "password: ", password);
    console.log("================================================");
  };

  return (
    <form onSubmit={handleSubmit}>
    <Input type="text" placeholder="ID" value={userId} onChange={handleUserIdChange} />
    <Input type="password" placeholder="Password" value={password} onChange={handlePasswordChange} />
    <Button type="submit">Login</Button>
    </form>
  );
}