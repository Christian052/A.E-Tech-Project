const nodemailer = require("nodemailer");
const logger = require("./logger");

let transporter = null;
let smtpAuthDisabled = false;

// Known placeholder strings or dummy passwords that should not trigger real SMTP connection attempts
const PLACEHOLDER_PASSWORDS = new Set([
  "app_password_here",
  "your_password",
  "your_app_password",
  "changeme",
  "password",
  "test",
  "example",
  "secret",
]);

function isPlaceholderOrInvalid(val) {
  if (!val) return true;
  const str = String(val).trim().toLowerCase();
  return (
    str.length === 0 ||
    PLACEHOLDER_PASSWORDS.has(str) ||
    str.includes("password_here") ||
    str.includes("your_")
  );
}

function getTransporter() {
  if (smtpAuthDisabled) return null;
  if (transporter) return transporter;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass || isPlaceholderOrInvalid(user) || isPlaceholderOrInvalid(pass)) {
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465 || !process.env.SMTP_PORT,
      auth: {
        user: user.trim(),
        pass: pass.trim().replace(/\s+/g, ""),
      },
    });
    return transporter;
  } catch (err) {
    logger.debug(`[mailer] failed to initialize transport: ${err.message}`);
    return null;
  }
}

// Fire-and-forget notification. Never throws — a failed email must not
// block the API response to the visitor who just submitted a form.
async function notifyAdmin(subject, text) {
  const t = getTransporter();
  const to = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;
  if (!t || !to) {
    logger.debug(`[mailer] skipped (not configured or placeholder credentials): ${subject}`);
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
    const msg = err?.message || "";
    // If the credentials are explicitly rejected by SMTP server (e.g. 535 BadCredentials),
    // disable further attempts to prevent spamming failed logins and generating error warnings.
    if (
      err?.code === "EAUTH" ||
      err?.responseCode === 535 ||
      msg.includes("535") ||
      msg.includes("Invalid login") ||
      msg.includes("BadCredentials")
    ) {
      smtpAuthDisabled = true;
      transporter = null;
      logger.info(
        `[mailer] SMTP authentication failed (535 BadCredentials). Notifications paused until valid Google App Password is provided in SMTP_PASS.`
      );
    } else {
      logger.debug(`[mailer] failed to send notification: ${msg}`);
    }
  }
}

module.exports = { notifyAdmin };
