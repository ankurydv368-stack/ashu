export const runtime = "nodejs";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8fafc" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "white", padding: 32, borderRadius: 16, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}>
        <h1 style={{ marginBottom: 8 }}>Sign in</h1>
        <p style={{ color: "#475569", marginBottom: 20 }}>Secure quotation approval portal</p>
        <LoginForm />
      </div>
    </main>
  );
}

function LoginForm() {
  return (
    <form action="/api/auth/callback/credentials" method="post" style={{ display: "grid", gap: 16 }}>
      <input type="hidden" name="csrfToken" value={""} />
      <div>
        <label style={{ display: "block", marginBottom: 6 }}>Email</label>
        <input name="email" type="email" required style={{ width: "100%", padding: 12, border: "1px solid #cbd5e1", borderRadius: 10 }} />
      </div>
      <div>
        <label style={{ display: "block", marginBottom: 6 }}>Password</label>
        <input name="password" type="password" required style={{ width: "100%", padding: 12, border: "1px solid #cbd5e1", borderRadius: 10 }} />
      </div>
      <button type="submit" style={{ padding: 12, border: "none", background: "#0f172a", color: "white", borderRadius: 10, fontWeight: 700 }}>
        Login
      </button>
      <div style={{ textAlign: "center" }}>
        <a href="/forgot-password" style={{ color: "#0f172a", textDecoration: "underline" }}>Forgot password?</a>
      </div>
    </form>
  );
}
