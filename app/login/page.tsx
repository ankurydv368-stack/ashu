import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8fafc" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: 32, background: "white", borderRadius: 16, border: "1px solid #e2e8f0" }}>
        <h1 style={{ margin: "0 0 8px" }}>Sign in</h1>
        <p style={{ margin: "0 0 24px", color: "#475569" }}>Secure quotation approval portal</p>
        <LoginForm />
        <div style={{ marginTop: 18, textAlign: "center" }}>
          <Link href="/forgot-password" style={{ textDecoration: "underline" }}>Forgot password?</Link>
        </div>
      </div>
    </main>
  );
}
