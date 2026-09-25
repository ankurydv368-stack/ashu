import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function ResetPasswordPage({ params }: { params: { token: string } }) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="container" style={{ display: "grid", placeItems: "center" }}>
      <div className="card" style={{ width: "100%", maxWidth: 460, padding: 32 }}>
        <h1 style={{ marginTop: 0 }}>Reset password</h1>
        <form action="/api/reset-password" method="POST" className="form-grid">
          <input type="hidden" name="token" value={params.token} />
          <div>
            <label htmlFor="password">New password</label>
            <input id="password" name="password" type="password" required minLength={8} />
          </div>
          <button type="submit" className="primary">Set new password</button>
        </form>
        <div style={{ marginTop: 18 }}>
          <Link href="/login">Back to login</Link>
        </div>
      </div>
    </main>
  );
}
