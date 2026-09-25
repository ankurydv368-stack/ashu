import { Resend } from "resend";

export async function sendTransactionalEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL STUB]", { to, subject, text });
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "noreply@example.com",
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html: html || `<p>${text}</p>`,
  });
}
