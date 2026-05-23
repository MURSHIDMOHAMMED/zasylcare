import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <form className="w-full max-w-md rounded-lg border bg-card p-6 shadow-soft">
        <h1 className="text-xl font-semibold">Create company workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">Set up a separate SaaS tenant for a business.</p>
        <div className="mt-6 space-y-3">
          <Input placeholder="Company name" />
          <Input placeholder="Admin full name" />
          <Input placeholder="Email" type="email" />
          <Input placeholder="Password" type="password" />
          <Button className="w-full">Create account</Button>
        </div>
        <Link className="mt-4 block text-sm text-muted-foreground" href="/login">Already have an account?</Link>
      </form>
    </main>
  );
}
