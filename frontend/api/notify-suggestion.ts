import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail, userName, university, type, value, faculty, department } = req.body;

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'examsyncuni@gmail.com';

    if (!BREVO_API_KEY) {
      console.log(`\n📧 [DEV MODE] Suggestion Notification\n   Admin Alert to: ${ADMIN_EMAIL}\n   User Confirmation to: ${userEmail}\n   Details: ${type} - ${value}\n`);
      return res.status(200).json({ success: true, message: 'Dev mode: Notification logged to console' });
    }

    const firstName = (userName || 'Student').split(' ')[0];

    // 1. ADMIN ALERT EMAIL
    const adminHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #7c3aed;">🔔 New Data Suggestion</h2>
        <p>A user has suggested new content that is currently missing from the application.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Suggested By:</strong> ${userName} (${userEmail})</p>
          <p><strong>University:</strong> ${university}</p>
          <p><strong>Type:</strong> <span style="text-transform: uppercase; font-weight: bold; color: #d97706;">${type}</span></p>
          <p><strong>Value:</strong> <span style="font-size: 18px; font-weight: 800;">"${value}"</span></p>
          ${faculty ? `<p><strong>Parent Faculty:</strong> ${faculty}</p>` : ''}
          ${department ? `<p><strong>Parent Department:</strong> ${department}</p>` : ''}
        </div>
        <p>You can approve or reject this suggestion from the <a href="https://examsyncuni.vercel.app/admin">Admin Dashboard</a>.</p>
      </div>
    `;

    // 2. USER CONFIRMATION EMAIL
    const userHtml = `
      <div style="font-family: sans-serif; padding: 40px; background: #09090b; color: #f4f4f5; text-align: center;">
        <div style="display: inline-block; background: rgba(124, 58, 237, 0.1); border-radius: 20px; padding: 20px; margin-bottom: 20px;">
           <span style="font-size: 40px;">🚀</span>
        </div>
        <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 10px;">Suggestion Received!</h1>
        <p style="color: #a1a1aa; font-size: 16px; max-width: 400px; margin: 0 auto 30px;">
          Hi ${firstName}, thanks for helping us build the ultimate academic database. We've received your request to add <strong>"${value}"</strong>.
        </p>
        <div style="background: #111113; border: 1px solid #27272a; border-radius: 16px; padding: 20px; text-align: left; max-width: 450px; margin: 0 auto 30px;">
           <p style="margin: 0 0 10px; font-size: 12px; text-transform: uppercase; color: #7c3aed; font-weight: 700;">What happens next?</p>
           <ul style="margin: 0; padding-left: 20px; color: #d1d5db; font-size: 14px; line-height: 1.6;">
             <li>Our administrative team will verify the details.</li>
             <li>Once approved, it will be available for everyone at ${university}.</li>
             <li>You can continue with your setup using this temporary entry.</li>
           </ul>
        </div>
        <p style="color: #52525b; font-size: 12px;">
          Sent by <strong>ExamSync</strong> · Your Academic Intelligence Platform
        </p>
      </div>
    `;

    // Send Admin Alert
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'ExamSync System', email: 'examsyncuni@gmail.com' },
        to: [{ email: ADMIN_EMAIL }],
        subject: `🔔 New ${type} Suggestion: "${value}"`,
        htmlContent: adminHtml,
      },
      { headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' } }
    );

    // Send User Confirmation
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'ExamSync', email: 'examsyncuni@gmail.com' },
        to: [{ email: userEmail, name: userName }],
        subject: `🚀 We're on it, ${firstName}!`,
        htmlContent: userHtml,
      },
      { headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' } }
    );

    res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('Notification error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
}
