import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="container" style={{ display: "grid", placeItems: "center" }}>
      <div className="card" style={{ width: "100%", maxWidth: 460, padding: 32 }}>
        <h1 style={{ marginTop: 0 }}>Forgot password</h1>
        <p className="muted">We send reset links using the same transactional email provider used across the system.</p>
        <form action="/api/forgot-password" method="POST" className="form-grid">
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
          </div>
          <button type="submit" className="primary">Send reset link</button>
        </form>
        <div style={{ marginTop: 18 }}>
          <Link href="/login">Back to login</Link>
        </div>
      </div>
    </main>
  );
}
