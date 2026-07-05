import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    if (!BREVO_API_KEY) {
      console.log(`\n📧 [DEV MODE] Waitlist Email triggered for ${email}\n   (Set BREVO_API_KEY in .env.local to send real emails)\n`);
      return res.status(200).json({ success: true, message: 'Dev mode: Email logged to console' });
    }

    const headers = {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // 1. Send Welcome Email to the User
    const userHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to the ExamSync Waitlist!</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background:#111113;border-radius:24px;overflow:hidden;border:1px solid #27272a;">
          <tr>
            <td style="background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 40%,#b45309 80%,#d97706 100%);padding:36px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:12px 16px;margin-bottom:16px;">
                <span style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-1px;vertical-align:middle;">⟳ ExamSync</span>
              </div>
              <p style="margin:0;color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">
                Waitlist Confirmation
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 8px;color:#f4f4f5;font-size:24px;font-weight:800;">
                You're on the list! 🎉
              </h1>
              <p style="margin:0 0 24px;color:#a1a1aa;font-size:15px;line-height:1.6;">
                Thank you for joining the ExamSync waitlist! We are working hard to build the ultimate academic intelligence platform, and we can't wait to share it with you.
              </p>
              <p style="margin:0 0 32px;color:#a1a1aa;font-size:15px;line-height:1.6;">
                We'll send you an email at this address as soon as we launch and your account is ready.
              </p>
              
              <div style="background:#0d0d1a;border:1.5px solid #4c1d95;border-radius:16px;padding:28px 24px;text-align:center;">
                <p style="margin:0;color:#7c3aed;font-size:16px;font-weight:700;">
                  Stay tuned for updates!
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#0a0a0b;border-top:1px solid #27272a;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#52525b;font-size:12px;">
                Sent by <strong style="color:#7c3aed;">ExamSync</strong> · Your Academic Intelligence Platform
              </p>
              <p style="margin:0;color:#3f3f46;font-size:11px;">
                Built with ❤️ by Glory Adeniran · University of Ilorin
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Promise.all to send both emails concurrently
    await Promise.all([
      // Send to user
      axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: 'ExamSync', email: 'examsyncuni@gmail.com' },
          to: [{ email }],
          subject: "You're on the list! 🎉 — ExamSync",
          htmlContent: userHtmlContent,
        },
        { headers }
      ).catch(e => console.error('Failed to send waitlist email to user:', e.response?.data || e.message)),
      
      // Send to admin
      axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: 'ExamSync System', email: 'examsyncuni@gmail.com' },
          to: [{ email: 'examsyncuni@gmail.com', name: 'Admin' }],
          subject: "🚀 New Waitlist Signup!",
          htmlContent: `<p>A new user just joined the ExamSync waitlist!</p><p><strong>Email:</strong> ${email}</p>`,
        },
        { headers }
      ).catch(e => console.error('Failed to send waitlist notification to admin:', e.response?.data || e.message))
    ]);

    res.status(200).json({ success: true });

  } catch (error: any) {
    const detail = error.response?.data || error.message;
    console.error('Waitlist email error:', detail);
    res.status(500).json({ error: 'Failed to process waitlist emails', detail });
  }
}
