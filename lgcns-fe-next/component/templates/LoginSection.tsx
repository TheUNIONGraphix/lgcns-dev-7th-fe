import LoginForm from "../organisms/LoginForm";

export default function LoginSection({
  handleSubmit,
}: {
  handleSubmit: (formData: FormData) => void;
}) {
  return (
    <section>
      <LoginForm handleSubmit={handleSubmit} />
    </section>
  );
}
