# Quotation Approval & Vendor Selection System

This project is a Next.js application for managing multi-department quotation approvals, automatic vendor selection, admin-controlled stages, password resets, and scheduled escalation handling.

## Local development

1. Install dependencies:
   npm install
2. Set environment variables in `.env.local`:
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="replace-with-secure-secret"
   NEXTAUTH_URL="http://localhost:3000"
   EMAIL_FROM="noreply@yourdomain.com"
   RESEND_API_KEY="your-key-if-using-resend"
   CRON_SECRET="changeme"
3. Create the database:
   npx prisma db push
4. Seed the initial admin account:
   npx tsx scripts/seed-admin.ts
5. Run the app:
   npm run dev

## Useful scripts

- `npm run cron:escalations` - process pending stage escalations and auto-termination checks
- `npm run db:push` - sync Prisma schema with the local database

## Default admin account

The seed script creates an initial admin:

- Email: admin@example.com
- Password: Admin@123

Change this after first login.
