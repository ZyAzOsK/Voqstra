const nodemailer = require('nodemailer');
const logger = require('../logger');

let cachedTransporter = null;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  // Auto-create a free Ethereal test account (no config needed)
  const testAccount = await nodemailer.createTestAccount();
  logger.info('Ethereal test email account created', { user: testAccount.user });

  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return cachedTransporter;
}

/**
 * Sends a follow-up notification email (simulated WhatsApp follow-up).
 * @returns {string} Ethereal preview URL to view the message
 */
async function sendFollowUp({ customerName, customerEmail, summary, actionItems }) {
  const transporter = await getTransporter();

  const actionList = Array.isArray(actionItems)
    ? actionItems.map((item) => `• ${item}`).join('\n')
    : String(actionItems);

  const messageBody = `Hi ${customerName},

Thank you for your call with us today! Here's a quick recap of what we discussed:

${summary}

Next Steps:
${actionList}

We'll be in touch shortly. Feel free to reply if you have any questions!

Best regards,
Voqstra Team`;

  const info = await transporter.sendMail({
    from: '"Voqstra" <noreply@voqstra.app>',
    to: customerEmail,
    subject: `Follow-up from your call — ${new Date().toLocaleDateString()}`,
    text: messageBody,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #6d28d9;">📞 Voqstra Call Follow-Up</h2>
        <p>Hi <strong>${customerName}</strong>,</p>
        <p>Thank you for your call today! Here's a quick recap:</p>
        <blockquote style="border-left: 4px solid #6d28d9; padding-left: 12px; color: #374151;">
          ${summary}
        </blockquote>
        <h3 style="color: #374151;">✅ Next Steps</h3>
        <ul>
          ${(Array.isArray(actionItems) ? actionItems : [actionItems]).map((i) => `<li>${i}</li>`).join('')}
        </ul>
        <p style="color: #6b7280; font-size: 0.9em;">We'll be in touch shortly. Reply to this email if you have any questions.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #9ca3af; font-size: 0.8em;">Voqstra — Smart Call Analytics</p>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  logger.info('Follow-up email sent via Ethereal', {
    to: customerEmail,
    previewUrl,
    messageId: info.messageId,
  });

  return { messageBody, previewUrl };
}

module.exports = { sendFollowUp };
