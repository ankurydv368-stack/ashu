import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const currentUser = await prisma.user.findUnique({ where: { id: (session.user as any).id }, include: { assignedStage: true } });
  const isAdmin = currentUser?.role === Role.ADMIN;
  const isApprover = currentUser?.role === Role.APPROVER;

  let requests: any[] = [];

  if (isAdmin) {
    requests = await prisma.request.findMany({
      orderBy: { createdAt: "desc" },
      include: { vendors: true, createdBy: true }
    });
  } else if (isApprover) {
    requests = await prisma.request.findMany({
      where: {
        status: "PENDING",
        currentStageIndex: currentUser.assignedStage?.order ?? -1
      },
      orderBy: { createdAt: "desc" },
      include: { vendors: true }
    });
  } else {
    requests = await prisma.request.findMany({
      where: { createdById: currentUser!.id },
      orderBy: { createdAt: "desc" },
      include: { vendors: true }
    });
  }

  return (
    <main>
      <div className="nav">
        <strong>Quotation Approval System</strong>
        <div className="nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/requests/new">New Request</Link>
          {isAdmin ? <><Link href="/admin/users">Users</Link><Link href="/admin/stages">Stages</Link></> : null}
          <form action="/api/auth/signout" method="POST"><button className="secondary" type="submit">Logout</button></form>
        </div>
      </div>

      <div className="container">
        <h1 className="page-title">Dashboard</h1>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div className="muted">Logged in as</div>
              <strong>{currentUser?.name}</strong>
            </div>
            <div className="badge">{currentUser?.role}</div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Status</th>
                <th>Selected Vendor</th>
                <th>Current Stage</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan={6} className="muted">No requests found.</td></tr>
              ) : requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.itemDescription}</td>
                  <td><span className="badge">{request.status}</span></td>
                  <td>{request.selectedVendor ?? "—"}</td>
                  <td>{request.currentStageIndex + 1}</td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td><Link href={`/requests/${request.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
