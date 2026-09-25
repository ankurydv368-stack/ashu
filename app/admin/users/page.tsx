import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const currentUser = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!currentUser || currentUser.role !== Role.ADMIN) redirect("/dashboard");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { assignedStage: true, createdByAdmin: true } });
  const stages = await prisma.stageConfig.findMany({ orderBy: { order: "asc" } });

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
        <h1 className="page-title">Admin Users</h1>
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3>Create user</h3>
          <form action="/api/admin/users" method="POST" className="form-grid">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
              <div><label>Name</label><input name="name" required /></div>
              <div><label>Email</label><input name="email" type="email" required /></div>
              <div><label>Password</label><input name="password" type="password" required minLength={8} /></div>
              <div>
                <label>Role</label>
                <select name="role">
                  <option value="REQUESTER">Requester</option>
                  <option value="APPROVER">Approver</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div>
              <label>Assigned stage (for approver)</label>
              <select name="assignedStageId">
                <option value="">No stage</option>
                {stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}
              </select>
            </div>
            <button type="submit" className="primary">Create account</button>
          </form>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3>Current accounts</h3>
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Stage</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.assignedStage?.name ?? "—"}</td>
                  <td>{user.isActive ? "Active" : "Inactive"}</td>
                  <td>
                    <form action="/api/admin/users" method="POST">
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="actionType" value={user.isActive ? "deactivate" : "activate"} />
                      <button type="submit" className={user.isActive ? "secondary" : "primary"}>{user.isActive ? "Deactivate" : "Activate"}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
