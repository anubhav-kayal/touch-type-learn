import { AuthForm } from "@/components/auth/AuthForm";
import { signIn } from "@/app/actions/auth";
import { AuthBar } from "@/components/auth/AuthBar";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in · Keypath",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-desk text-ink">
      <header className="flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-display text-sm tracking-wide text-legend hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bump"
        >
          Keypath
        </Link>
        <AuthBar />
      </header>
      <main className="mx-auto flex w-full flex-1 items-center justify-center px-6 pb-16">
        <AuthForm
          title="Sign in"
          action={signIn}
          submitLabel="Sign in"
          switchHref="/signup"
          switchLabel="Need an account? Sign up"
        />
      </main>
    </div>
  );
}
