import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function NewRequestPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user || user.role === Role.APPROVER && !user.isActive) redirect("/dashboard");

  return (
    <main>
      <div className="nav">
        <strong>Quotation Approval System</strong>
        <div className="nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/requests/new">New Request</Link>
          {user.role === Role.ADMIN ? <><Link href="/admin/users">Users</Link><Link href="/admin/stages">Stages</Link></> : null}
          <form action="/api/auth/signout" method="POST"><button className="secondary" type="submit">Logout</button></form>
        </div>
      </div>

      <div className="container">
        <h1 className="page-title">Create Request</h1>
        <div className="card" style={{ padding: 20 }}>
          <form action="/api/requests" method="POST" className="form-grid">
            <div>
              <label htmlFor="itemDescription">Item description</label>
              <input id="itemDescription" name="itemDescription" required />
            </div>
            <div>
              <label>Vendor quotes (3-10)</label>
              <div className="form-grid" style={{ marginTop: 12 }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 140px 1fr", gap: 12 }}>
                    <input name={`vendorName-${index}`} placeholder="Vendor name" required />
                    <input name={`vendorPrice-${index}`} type="number" step="0.01" min="0" placeholder="Price" required />
                    <input name={`vendorEmail-${index}`} type="email" placeholder="Vendor email (optional)" />
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" className="primary">Create Request</button>
          </form>
        </div>
      </div>
    </main>
  );
}
