const nodemailer = require('nodemailer');

/**
 * Email Service - Handles sending emails using nodemailer
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize email transporter with environment variables
   */
  initialize() {
    if (this.initialized) return;

    const {
      EMAIL_HOST,
      EMAIL_PORT,
      EMAIL_SECURE,
      EMAIL_USER,
      EMAIL_PASS,
      EMAIL_FROM,
    } = process.env;

    // Check if email configuration is available
    if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
      console.warn('⚠️ Email configuration not found. Email sending will be disabled.');
      console.warn('   Add EMAIL_HOST, EMAIL_USER, EMAIL_PASS to your .env file.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: parseInt(EMAIL_PORT) || 587,
        secure: EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });

      this.fromEmail = EMAIL_FROM || EMAIL_USER;
      this.initialized = true;
      console.log('✓ Email service initialized successfully');
    } catch (error) {
      console.error('✗ Failed to initialize email service:', error.message);
    }
  }

  /**
   * Send email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Plain text content
   * @param {string} options.html - HTML content
   * @returns {Promise<Object>} Send result
   */
  async sendEmail({ to, subject, text, html }) {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.transporter) {
      console.log('📧 Email not sent (service not configured):', { to, subject });
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        text,
        html,
      });

      console.log('✓ Email sent successfully:', {
        to,
        subject,
        messageId: info.messageId,
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('✗ Failed to send email:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email with user credentials
   * @param {Object} userData - User data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.loginId - Generated login ID
   * @param {string} userData.role - User's role
   * @param {string} userData.password - Temporary password (plain text)
   */
  async sendWelcomeEmail(userData) {
    const { name, email, loginId, role, password } = userData;

    const subject = 'Welcome to WorkZen - Your Account Details';
    
    const text = `
Hello ${name},

Welcome to WorkZen! Your account has been created successfully.

Your login credentials are:
Login ID: ${loginId}
Email: ${email}
Temporary Password: ${password}
Role: ${role}

You can login using either your Login ID or Email address.

Please change your password after your first login for security purposes.

If you have any questions, please contact your administrator.

Best regards,
WorkZen Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 30px;
    }
    .header {
      background-color: #4F46E5;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
      margin: -30px -30px 20px -30px;
    }
    .credentials {
      background-color: white;
      border: 1px solid #e0e0e0;
      border-radius: 5px;
      padding: 20px;
      margin: 20px 0;
    }
    .credential-item {
      margin: 10px 0;
      padding: 8px;
      background-color: #f5f5f5;
      border-left: 3px solid #4F46E5;
    }
    .credential-label {
      font-weight: bold;
      color: #4F46E5;
    }
    .credential-value {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #333;
    }
    .note {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Welcome to WorkZen!</h1>
    </div>
    
    <p>Hello <strong>${name}</strong>,</p>
    
    <p>Your account has been created successfully by the administrator. Below are your login credentials:</p>
    
    <div class="credentials">
      <div class="credential-item">
        <div class="credential-label">Login ID:</div>
        <div class="credential-value">${loginId}</div>
      </div>
      <div class="credential-item">
        <div class="credential-label">Email:</div>
        <div class="credential-value">${email}</div>
      </div>
      <div class="credential-item">
        <div class="credential-label">Temporary Password:</div>
        <div class="credential-value">${password}</div>
      </div>
      <div class="credential-item">
        <div class="credential-label">Role:</div>
        <div class="credential-value">${role}</div>
      </div>
    </div>
    
    <div class="note">
      <strong>📌 Important:</strong> You can login using either your <strong>Login ID</strong> or <strong>Email address</strong>. 
      Please change your password after your first login for security purposes.
    </div>
    
    <p>If you have any questions or need assistance, please contact your administrator.</p>
    
    <p>Best regards,<br><strong>WorkZen Team</strong></p>
    
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return await this.sendEmail({ to: email, subject, text, html });
  }
}

module.exports = new EmailService();
