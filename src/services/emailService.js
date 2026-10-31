const nodemailer = require('nodemailer');
const env = require('../config/env');

class EmailService {
  constructor() {
    this.transporter = null;
    this._init();
  }

  _init() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });
    }
  }

  async _send(to, subject, html) {
    if (!this.transporter) {
      if (env.isDev) {
        console.log('📧 EMAIL (DEV - No SMTP configured)');
        console.log(`   To: ${to}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Body: [HTML content omitted]`);
      }
      return;
    }
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
    });
  }

  async sendPasswordReset(email, name, resetUrl) {
    const subject = 'SubFlow - Password Reset Request';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">SubFlow Password Reset</h2>
        <p>Hi ${name},</p>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px;">SubFlow - Unified Subscription & Billing Platform</p>
      </div>
    `;
    await this._send(email, subject, html);
  }

  async sendInvoiceNotification(email, name, invoiceNumber, grandTotal, dueDate) {
    const subject = `SubFlow - Invoice ${invoiceNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">New Invoice</h2>
        <p>Hi ${name},</p>
        <p>A new invoice has been generated for your subscription:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Invoice</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${invoiceNumber}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Amount</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">₹${grandTotal.toFixed(2)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Due Date</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date(dueDate).toLocaleDateString()}</td></tr>
        </table>
        <p>Please make payment before the due date to avoid any service interruption.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px;">SubFlow - Unified Subscription & Billing Platform</p>
      </div>
    `;
    await this._send(email, subject, html);
  }

  async sendPaymentConfirmation(email, name, paymentNumber, amount, invoiceNumber) {
    const subject = `SubFlow - Payment Confirmation ${paymentNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Payment Received</h2>
        <p>Hi ${name},</p>
        <p>We've received your payment:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Payment</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${paymentNumber}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Amount</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">₹${amount.toFixed(2)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Invoice</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${invoiceNumber}</td></tr>
        </table>
        <p>Thank you for your payment!</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px;">SubFlow - Unified Subscription & Billing Platform</p>
      </div>
    `;
    await this._send(email, subject, html);
  }

  async sendRenewalReminder(email, name, subscriptionNumber, expiryDate) {
    const subject = `SubFlow - Subscription Renewal Reminder`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Renewal Reminder</h2>
        <p>Hi ${name},</p>
        <p>Your subscription <strong>${subscriptionNumber}</strong> is approaching its renewal date on <strong>${new Date(expiryDate).toLocaleDateString()}</strong>.</p>
        <p>Please ensure your payment method is up to date.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px;">SubFlow - Unified Subscription & Billing Platform</p>
      </div>
    `;
    await this._send(email, subject, html);
  }
}

module.exports = new EmailService();
