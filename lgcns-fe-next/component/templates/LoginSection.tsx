import LoginForm from "../organisms/LoginForm";

export default function LoginSection({
  handleSubmit,
}: {
  handleSubmit: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <section>
      <form action={handleSubmit}>
        <LoginForm />
      </form>
    </section>
  );
}
