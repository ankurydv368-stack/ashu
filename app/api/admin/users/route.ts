// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"));

  const admin = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!admin || admin.role !== Role.ADMIN) return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL || "http://localhost:3000"));

  const formData = await request.formData();
  const name = formData.get("name")?.toString() ?? "";
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const role = formData.get("role")?.toString() as Role | undefined;
  const assignedStageId = formData.get("assignedStageId")?.toString() ?? "";

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (role === Role.ADMIN && assignedStageId) {
    return NextResponse.json({ error: "Admins cannot be assigned to a stage" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      role,
      isActive: true,
      createdByAdminId: admin.id,
      assignedStageId: assignedStageId || null
    }
  });

  if (role === Role.APPROVER && assignedStageId) {
    await prisma.stageConfig.update({ where: { id: assignedStageId }, data: { approverUserId: user.id } });
  }

  return NextResponse.redirect(new URL("/admin/users", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
