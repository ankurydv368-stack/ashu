// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"));

  const admin = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!admin || admin.role !== Role.ADMIN) return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL || "http://localhost:3000"));

  const formData = await request.formData();
  const actionType = formData.get("actionType")?.toString();

  if (actionType === "activate" || actionType === "deactivate") {
    const userId = formData.get("userId")?.toString();
    if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: actionType === "activate" }
    });
    return NextResponse.redirect(new URL("/admin/users", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  }

  return NextResponse.redirect(new URL("/admin/users", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
