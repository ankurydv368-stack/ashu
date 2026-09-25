import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function AdminStagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const currentUser = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!currentUser || currentUser.role !== Role.ADMIN) redirect("/dashboard");

  const stages = await prisma.stageConfig.findMany({ orderBy: { order: "asc" }, include: { approverUser: true } });
  const users = await prisma.user.findMany({ where: { role: Role.APPROVER }, include: { assignedStage: true } });

  return (
    <main>
      <div className="nav">
        <strong>Quotation Approval System</strong>
        <div className="nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/requests/new">New Request</Link>
          <Link href="/admin/users">Users</Link>
          <Link href="/admin/stages">Stages</Link>
          <form action="/api/auth/signout" method="POST"><button className="secondary" type="submit">Logout</button></form>
        </div>
      </div>

      <div className="container">
        <h1 className="page-title">Approval Chain</h1>
        <div className="card" style={{ padding: 20 }}>
          <form action="/api/admin/stages" method="POST" className="form-grid">
            {stages.map((stage, index) => (
              <div key={stage.id} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: 12 }}>
                <div><label>Order</label><input name={`stages[${index}][order]`} value={stage.order} readOnly /></div>
                <div><label>Stage name</label><input name={`stages[${index}][name]`} defaultValue={stage.name} /></div>
                <div>
                  <label>Approver</label>
                  <select name={`stages[${index}][approverUserId]`} defaultValue={stage.approverUserId ?? ""}>
                    <option value="">Unassigned</option>
                    {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
                  </select>
                </div>
              </div>
            ))}
            <button type="submit" className="primary">Save approval chain</button>
          </form>
        </div>
      </div>
    </main>
  );
}
