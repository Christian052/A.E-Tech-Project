const nodemailer = require("nodemailer");
const logger = require("./logger");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

// Fire-and-forget notification. Never throws — a failed email must not
// block the API response to the visitor who just submitted a form.
async function notifyAdmin(subject, text) {
  const t = getTransporter();
  const to = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;
  if (!t || !to) {
    logger.debug(`[mailer] skipped (not configured): ${subject}`);
    return;
  }
  try {
    await t.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
    });
  } catch (err) {
    logger.warn(`[mailer] failed to send notification: ${err.message}`);
  }
}

module.exports = { notifyAdmin };
