import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, code, name, type } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'email and code are required' });
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    if (!BREVO_API_KEY) {
      console.log(`\n📧 [DEV MODE] OTP for ${email}: ${code}\n   (Set BREVO_API_KEY in .env.local to send real emails)\n`);
      return res.status(200).json({ success: true, message: 'Dev mode: OTP logged to console' });
    }

    const isReset = type === 'reset';
    const firstName = (name || 'Student').split(' ')[0];

    // Split the code into individual digits for display
    const digits = code.split('').map((d: string) => `
      <td style="padding: 0 4px;">
        <div style="
          width: 48px;
          height: 60px;
          background: #1a1a2e;
          border: 2px solid #7c3aed;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 900;
          color: #c4b5fd;
          font-family: 'Courier New', monospace;
          text-align: center;
          vertical-align: middle;
          line-height: 60px;
        ">${d}</div>
      </td>
    `).join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ExamSync — ${isReset ? 'Password Reset' : 'Verify Your Email'}</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table width="100%" style="max-width:580px;background:#111113;border-radius:24px;overflow:hidden;border:1px solid #27272a;">

          <!-- HEADER GRADIENT BANNER -->
          <tr>
            <td style="background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 40%,#b45309 80%,#d97706 100%);padding:36px 40px;text-align:center;">
              <!-- Logo icon placeholder -->
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:12px 16px;margin-bottom:16px;">
                <span style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-1px;vertical-align:middle;">⟳ ExamSync</span>
              </div>
              <p style="margin:0;color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">
                ${isReset ? 'Password Reset Request' : 'Email Verification'}
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px;">

              <!-- Greeting -->
              <h1 style="margin:0 0 8px;color:#f4f4f5;font-size:24px;font-weight:800;">
                Hi ${firstName}! 👋
              </h1>
              <p style="margin:0 0 32px;color:#a1a1aa;font-size:15px;line-height:1.6;">
                ${isReset
                  ? 'You requested to reset your ExamSync password. Use the code below to continue. If you didn\'t request this, you can safely ignore this email.'
                  : 'Welcome to ExamSync! You\'re one step away from accessing your personalized academic schedule. Enter the code below to verify your email address.'
                }
              </p>

              <!-- CODE BOX -->
              <div style="background:#0d0d1a;border:1.5px solid #4c1d95;border-radius:16px;padding:28px 24px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 16px;color:#7c3aed;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">
                  Your ${isReset ? 'Reset' : 'Verification'} Code
                </p>
                <!-- Digit boxes -->
                <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                  <tr>${digits}</tr>
                </table>
                <!-- Full code as fallback -->
                <p style="margin:0;color:#52525b;font-size:12px;">
                  Or enter the code: <strong style="color:#a78bfa;letter-spacing:4px;font-family:'Courier New',monospace;">${code}</strong>
                </p>
              </div>

              <!-- Expiry warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#1c1917;border:1px solid #292524;border-radius:12px;padding:14px 18px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:12px;vertical-align:middle;">
                          <div style="width:36px;height:36px;background:#d97706;border-radius:50%;text-align:center;line-height:36px;font-size:18px;">⏱</div>
                        </td>
                        <td style="vertical-align:middle;">
                          <p style="margin:0;color:#d97706;font-size:13px;font-weight:700;">Expires in 15 minutes</p>
                          <p style="margin:4px 0 0;color:#78716c;font-size:12px;">Do not share this code with anyone.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What to do next -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:20px;">
                    <p style="margin:0 0 12px;color:#7c3aed;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">What to do next</p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;color:#94a3b8;font-size:13px;">
                          <span style="color:#7c3aed;font-weight:700;margin-right:8px;">1.</span>
                          Go back to ExamSync
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#94a3b8;font-size:13px;">
                          <span style="color:#7c3aed;font-weight:700;margin-right:8px;">2.</span>
                          Enter the 6-digit code above
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#94a3b8;font-size:13px;">
                          <span style="color:#7c3aed;font-weight:700;margin-right:8px;">3.</span>
                          ${isReset ? 'Set your new password' : 'Access your personalized schedule!'}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Security notice -->
              <p style="margin:0;color:#3f3f46;font-size:12px;line-height:1.6;border-top:1px solid #27272a;padding-top:20px;">
                🔒 <strong style="color:#52525b;">Security tip:</strong> ExamSync will never ask for your password. If you did not request this code, please ignore this email — your account is safe.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
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

    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'ExamSync', email: 'examsyncuni@gmail.com' },
        to: [{ email, name: name || 'Student' }],
        subject: `${code} — Your ExamSync ${isReset ? 'password reset' : 'verification'} code`,
        htmlContent,
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    res.status(200).json({ success: true });

  } catch (error: any) {
    const detail = error.response?.data || error.message;
    console.error('Brevo send error:', detail);
    res.status(500).json({ error: 'Failed to send verification email', detail });
  }
}
