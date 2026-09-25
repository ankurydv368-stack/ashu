import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const request = await prisma.request.findUnique({
    where: { id: params.id },
    include: { vendors: true, approvalEvents: { orderBy: { createdAt: "asc" } }, createdBy: true }
  });

  if (!request) notFound();

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  const isAdmin = user?.role === Role.ADMIN;
  const isRequester = request.createdById === user?.id;
  const currentStage = await prisma.stageConfig.findFirst({ where: { order: request.currentStageIndex } });
  const canAct = isAdmin || (user?.role === Role.APPROVER && currentStage?.approverUserId === user.id && request.status === "PENDING");

  return (
    <main>
      <div className="nav">
        <strong>Quotation Approval System</strong>
        <div className="nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/requests/new">New Request</Link>
          {user?.role === Role.ADMIN ? <><Link href="/admin/users">Users</Link><Link href="/admin/stages">Stages</Link></> : null}
          <form action="/api/auth/signout" method="POST"><button className="secondary" type="submit">Logout</button></form>
        </div>
      </div>

      <div className="container">
        <h1 className="page-title">Request Details</h1>
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div className="muted">Request</div>
              <h2 style={{ margin: 0 }}>{request.itemDescription}</h2>
            </div>
            <span className="badge">{request.status}</span>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(180px, 1fr))" }}>
            <div><strong>Selected vendor:</strong><div>{request.selectedVendor ?? "—"}</div></div>
            <div><strong>Selected price:</strong><div>{request.selectedPrice ? `$${request.selectedPrice.toFixed(2)}` : "—"}</div></div>
            <div><strong>Stage index:</strong><div>{request.currentStageIndex + 1}</div></div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3>Vendor comparison</h3>
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Price</th><th>Email</th></tr>
            </thead>
            <tbody>
              {request.vendors.map((vendor: any) => (
                <tr key={vendor.id}>
                  <td>{vendor.name}</td>
                  <td>${vendor.price.toFixed(2)}</td>
                  <td>{vendor.email ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3>Approval timeline</h3>
          {request.approvalEvents.length === 0 ? <p className="muted">No approval events yet.</p> : (
            <ul>
              {request.approvalEvents.map((event: any) => (
                <li key={event.id}>
                  <strong>{event.action ?? "System"}</strong> — {event.message} ({new Date(event.createdAt).toLocaleString()})
                </li>
              ))}
            </ul>
          )}
        </div>

        {isRequester || isAdmin ? (
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h3>Add a new vendor quote</h3>
            <form action={`/api/requests/${request.id}/vendors`} method="POST" className="form-grid">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 1fr", gap: 12 }}>
                <input name="vendorName" placeholder="Vendor name" required />
                <input name="vendorPrice" type="number" step="0.01" min="0" placeholder="Price" required />
                <input name="vendorEmail" type="email" placeholder="Vendor email (optional)" />
              </div>
              <button type="submit" className="primary">Add vendor</button>
            </form>
          </div>
        ) : null}

        {canAct ? (
          <div className="card" style={{ padding: 20 }}>
            <h3>Stage action</h3>
            <form action={`/api/requests/${request.id}/decision`} method="POST" style={{ display: "flex", gap: 12 }}>
              <input type="hidden" name="decision" value="APPROVE" />
              <button type="submit" className="success">Approve</button>
            </form>
            <form action={`/api/requests/${request.id}/decision`} method="POST" style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <input type="hidden" name="decision" value="REJECT" />
              <button type="submit" className="danger">Reject</button>
            </form>
          </div>
        ) : null}
      </div>
    </main>
  );
}
