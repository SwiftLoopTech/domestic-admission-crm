import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 text-black">
      <div className="w-full max-w-4xl">
        <LoginForm />
      </div>
    </div>
  );
}