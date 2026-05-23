"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signInWithEmail } from "@/services/auth.service";

export default function LoginPage() {
  const { register, handleSubmit, formState } = useForm<{ email: string; password: string }>();

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <form className="w-full max-w-md rounded-lg border bg-card p-6 shadow-soft" onSubmit={handleSubmit((values) => signInWithEmail(values.email, values.password))}>
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Admin login</h1>
            <p className="text-sm text-muted-foreground">Sign in to manage leads, bookings, and knowledge.</p>
          </div>
        </div>
        <div className="space-y-3">
          <Input placeholder="Email" type="email" {...register("email", { required: true })} />
          <Input placeholder="Password" type="password" {...register("password", { required: true })} />
          <Button className="w-full" disabled={formState.isSubmitting}>Login</Button>
        </div>
        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          <Link href="/register">Create account</Link>
          <Link href="/login">Forgot password?</Link>
        </div>
      </form>
    </main>
  );
}
