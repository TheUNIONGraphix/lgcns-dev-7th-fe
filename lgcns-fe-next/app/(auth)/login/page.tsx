import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {

  async function handleSubmit(formData: FormData) {
    "use server";
    const userId = formData.get("userId");
    const password = formData.get("password");
    console.log("================================================");
    console.log("userId: ", userId, "password: ", password);
    console.log("================================================");
  }

  return (
    <form action={handleSubmit} >
      <Input type="text" placeholder="ID" name="userId" />
      <Input type="password" placeholder="Password" name="password" />
      <Button type="submit">Login</Button>
    </form>
  );
}