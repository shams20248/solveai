const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || 'apikey';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@solveai.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'almoizaledrisi@gmail.com';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: SMTP_PASS
    ? {
        user: SMTP_USER,
        pass: SMTP_PASS,
      }
    : undefined,
});

async function sendMail({ to, subject, text, html }) {
  if (!SMTP_PASS) {
    return {
      success: false,
      message: 'SMTP credentials are not configured. Set SMTP_PASS in the environment before sending emails.',
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"SolveAI" <${FROM_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

async function sendContactNotification({ name, email, company, message }) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.7; color:#0c1b2a;">
      <h2>New SolveAI Contact Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company || 'Not provided'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    </div>
  `;

  return sendMail({
    to: ADMIN_EMAIL,
    subject: 'New contact request from SolveAI website',
    text: `New contact request from ${name} (${email})\nCompany: ${company || 'Not provided'}\nMessage: ${message}`,
    html,
  });
}

async function sendClientConfirmation({ email, name }) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.7; color:#0c1b2a;">
      <h2>Thank you for contacting SolveAI</h2>
      <p>Hello ${name},</p>
      <p>Your request has been received and will be reviewed by a human team member before any further action.</p>
      <p>We will contact you shortly.</p>
      <p>Regards,<br />SolveAI Team</p>
    </div>
  `;

  return sendMail({
    to: email,
    subject: 'Your SolveAI inquiry has been received',
    text: `Hello ${name},\n\nYour request has been received and will be reviewed by a human team member before any further action.\n\nRegards,\nSolveAI Team`,
    html,
  });
}

async function sendRequestNotification({ contactName, contactEmail, serviceType, companyName, description }) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.7; color:#0c1b2a;">
      <h2>New Service Request</h2>
      <p><strong>Contact:</strong> ${contactName}</p>
      <p><strong>Email:</strong> ${contactEmail}</p>
      <p><strong>Company:</strong> ${companyName || 'Not provided'}</p>
      <p><strong>Service:</strong> ${serviceType}</p>
      <p><strong>Description:</strong></p>
      <p>${description}</p>
    </div>
  `;

  return sendMail({
    to: ADMIN_EMAIL,
    subject: `New SolveAI service request: ${serviceType}`,
    text: `New service request\nContact: ${contactName}\nEmail: ${contactEmail}\nCompany: ${companyName || 'Not provided'}\nService: ${serviceType}\nDescription: ${description}`,
    html,
  });
}

async function sendInvoiceEmail({ email, name, service, amount, invoiceNumber, wallet, network }) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.7; color:#0c1b2a;">
      <h2>SolveAI Invoice</h2>
      <p>Hello ${name},</p>
      <p>Your invoice for <strong>${service}</strong> has been created.</p>
      <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
      <p><strong>Amount:</strong> ${amount} USDT</p>
      <p><strong>Wallet:</strong> ${wallet}</p>
      <p><strong>Network:</strong> ${network}</p>
      <p>Please send only USDT on BNB Smart Chain (BEP-20) and verify the transaction hash before sending.</p>
      <p>Regards,<br />SolveAI Team</p>
    </div>
  `;

  return sendMail({
    to: email,
    subject: `SolveAI invoice ${invoiceNumber}`,
    text: `Hello ${name},\n\nYour invoice for ${service} has been created.\nInvoice Number: ${invoiceNumber}\nAmount: ${amount} USDT\nWallet: ${wallet}\nNetwork: ${network}\nPlease send only USDT on BNB Smart Chain (BEP-20).\n\nRegards,\nSolveAI Team`,
    html,
  });
}

module.exports = {
  sendMail,
  sendContactNotification,
  sendClientConfirmation,
  sendRequestNotification,
  sendInvoiceEmail,
};
