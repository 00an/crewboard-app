// app/[locale]/(open)/login/page.tsx
import LoginForm from "../../../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      {/* Login Form */}
      <section>
        <LoginForm />
      </section>
    </main>
  );
}