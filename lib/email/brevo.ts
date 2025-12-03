import * as nodemailer from 'nodemailer'

const BREVO_SMTP_HOST = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com'
const BREVO_SMTP_PORT = parseInt(process.env.BREVO_SMTP_PORT || '587')
const BREVO_SMTP_USER = process.env.BREVO_SMTP_USER || ''
const BREVO_SMTP_PASSWORD = process.env.BREVO_SMTP_PASSWORD || ''
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@accucoder.com'
const FROM_NAME = process.env.FROM_NAME || 'AccuCoder'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Create transporter
const transporter = nodemailer.createTransport({
  host: BREVO_SMTP_HOST,
  port: BREVO_SMTP_PORT,
  secure: false, // Use TLS
  auth: {
    user: BREVO_SMTP_USER,
    pass: BREVO_SMTP_PASSWORD,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })
    console.log('✅ Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    throw error
  }
}

// Email templates
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${APP_URL}/api/auth/verify-email?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verify Your Email - AccuCoder</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f5f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
        .email-wrapper { width: 100%; background: #f5f7fa; padding: 40px 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); border: 1px solid #e5e7eb; }
        .email-header { background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%); padding: 40px 48px; text-align: center; border-bottom: 3px solid #4a5568; }
        .logo { height: 56px; width: auto; margin: 0 auto 16px; display: block; }
        .header-title { color: #ffffff; font-size: 15px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; margin: 0; }
        .email-body { padding: 48px; }
        .greeting { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 24px 0; letter-spacing: -0.5px; }
        .message { font-size: 16px; color: #4a5568; margin: 0 0 16px 0; line-height: 1.7; }
        .info-box { background: #f8fafc; border-left: 4px solid #4a5568; padding: 20px 24px; margin: 32px 0; border-radius: 4px; }
        .info-box p { margin: 0; font-size: 15px; color: #475569; line-height: 1.6; }
        .button-container { text-align: center; margin: 40px 0; }
        .button { display: inline-block; padding: 16px 48px; background: #2d3748; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(45, 55, 72, 0.15); }
        .button:hover { background: #1a202c; box-shadow: 0 4px 8px rgba(45, 55, 72, 0.25); }
        .divider { height: 1px; background: #e5e7eb; margin: 32px 0; }
        .security-note { font-size: 14px; color: #64748b; margin: 24px 0 0 0; padding: 16px; background: #f1f5f9; border-radius: 4px; }
        .email-footer { background: #f8fafc; padding: 32px 48px; border-top: 1px solid #e5e7eb; }
        .footer-content { text-align: center; }
        .company-info { margin: 0 0 12px 0; }
        .company-name { font-size: 16px; font-weight: 600; color: #2d3748; margin: 0 0 4px 0; }
        .company-tagline { font-size: 13px; color: #64748b; margin: 0; }
        .footer-links { margin: 16px 0 0 0; }
        .footer-link { color: #4a5568; text-decoration: none; font-size: 13px; margin: 0 12px; }
        .footer-link:hover { color: #2d3748; text-decoration: underline; }
        .copyright { font-size: 12px; color: #94a3b8; margin: 16px 0 0 0; }
        @media only screen and (max-width: 600px) {
          .email-body { padding: 32px 24px; }
          .email-header { padding: 32px 24px; }
          .email-footer { padding: 24px; }
          .greeting { font-size: 20px; }
          .button { padding: 14px 32px; font-size: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          <div class="email-header">
            <img src="https://i.imgur.com/your-logo.png" alt="AccuCoder" class="logo" />
            <p class="header-title">Email Verification</p>
          </div>
          <div class="email-body">
            <h1 class="greeting">Welcome to AccuCoder</h1>
            <p class="message">Thank you for creating an account with AccuCoder, your trusted platform for medical coding excellence.</p>
            <p class="message">To complete your registration and access our comprehensive medical coding tools, please verify your email address by clicking the button below:</p>
            <div class="button-container">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <div class="info-box">
              <p><strong>What happens next?</strong></p>
              <p>Once verified, you'll have full access to our ICD-10, CPT, and HCPCS coding resources, documentation tools, and professional coding assistant.</p>
            </div>
            <div class="divider"></div>
            <p class="security-note"><strong>Security Notice:</strong> If you didn't create an account with AccuCoder, please disregard this email. Your email address will not be used without verification.</p>
          </div>
          <div class="email-footer">
            <div class="footer-content">
              <div class="company-info">
                <p class="company-name">AccuCoder</p>
                <p class="company-tagline">Professional Medical Coding Solutions</p>
              </div>
              <p class="copyright">&copy; ${new Date().getFullYear()} AccuCoder. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - AccuCoder',
    html,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Password Reset Request - AccuCoder</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f5f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
        .email-wrapper { width: 100%; background: #f5f7fa; padding: 40px 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); border: 1px solid #e5e7eb; }
        .email-header { background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%); padding: 40px 48px; text-align: center; border-bottom: 3px solid #4a5568; }
        .logo { height: 56px; width: auto; margin: 0 auto 16px; display: block; }
        .header-title { color: #ffffff; font-size: 15px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; margin: 0; }
        .email-body { padding: 48px; }
        .greeting { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 24px 0; letter-spacing: -0.5px; }
        .message { font-size: 16px; color: #4a5568; margin: 0 0 16px 0; line-height: 1.7; }
        .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px 24px; margin: 32px 0; border-radius: 4px; }
        .info-box p { margin: 0 0 8px 0; font-size: 15px; color: #92400e; line-height: 1.6; }
        .info-box p:last-child { margin: 0; }
        .button-container { text-align: center; margin: 40px 0; }
        .button { display: inline-block; padding: 16px 48px; background: #2d3748; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(45, 55, 72, 0.15); }
        .button:hover { background: #1a202c; box-shadow: 0 4px 8px rgba(45, 55, 72, 0.25); }
        .divider { height: 1px; background: #e5e7eb; margin: 32px 0; }
        .security-note { font-size: 14px; color: #64748b; margin: 24px 0 0 0; padding: 16px; background: #f1f5f9; border-radius: 4px; }
        .email-footer { background: #f8fafc; padding: 32px 48px; border-top: 1px solid #e5e7eb; }
        .footer-content { text-align: center; }
        .company-info { margin: 0 0 12px 0; }
        .company-name { font-size: 16px; font-weight: 600; color: #2d3748; margin: 0 0 4px 0; }
        .company-tagline { font-size: 13px; color: #64748b; margin: 0; }
        .footer-links { margin: 16px 0 0 0; }
        .footer-link { color: #4a5568; text-decoration: none; font-size: 13px; margin: 0 12px; }
        .footer-link:hover { color: #2d3748; text-decoration: underline; }
        .copyright { font-size: 12px; color: #94a3b8; margin: 16px 0 0 0; }
        @media only screen and (max-width: 600px) {
          .email-body { padding: 32px 24px; }
          .email-header { padding: 32px 24px; }
          .email-footer { padding: 24px; }
          .greeting { font-size: 20px; }
          .button { padding: 14px 32px; font-size: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          <div class="email-header">
            <img src="https://i.imgur.com/your-logo.png" alt="AccuCoder" class="logo" />
            <p class="header-title">Password Reset Request</p>
          </div>
          <div class="email-body">
            <h1 class="greeting">Reset Your Password</h1>
            <p class="message">We received a request to reset the password for your AccuCoder account associated with this email address.</p>
            <p class="message">If you made this request, click the button below to set a new password:</p>
            <div class="button-container">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <div class="info-box">
              <p><strong>⚠️ Important Security Information:</strong></p>
              <p>• This password reset link expires in 24 hours</p>
              <p>• For security, you can only use this link once</p>
              <p>• If you didn't request this reset, please ignore this email</p>
            </div>
            <div class="divider"></div>
            <p class="security-note"><strong>Need Help?</strong> If you're having trouble accessing your account or didn't request this password reset, please contact our support team immediately to secure your account.</p>
          </div>
          <div class="email-footer">
            <div class="footer-content">
              <div class="company-info">
                <p class="company-name">AccuCoder</p>
                <p class="company-tagline">Professional Medical Coding Solutions</p>
              </div>
              <p class="copyright">&copy; ${new Date().getFullYear()} AccuCoder. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - AccuCoder',
    html,
  })
}

export async function sendInviteEmail(email: string, token: string) {
  const inviteUrl = `${APP_URL}/accept-invite?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>You're Invited to AccuCoder</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f5f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
        .email-wrapper { width: 100%; background: #f5f7fa; padding: 40px 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); border: 1px solid #e5e7eb; }
        .email-header { background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%); padding: 40px 48px; text-align: center; border-bottom: 3px solid #4a5568; }
        .logo { height: 56px; width: auto; margin: 0 auto 16px; display: block; }
        .header-title { color: #ffffff; font-size: 15px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; margin: 0; }
        .email-body { padding: 48px; }
        .greeting { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 24px 0; letter-spacing: -0.5px; }
        .message { font-size: 16px; color: #4a5568; margin: 0 0 16px 0; line-height: 1.7; }
        .highlight { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px 24px; margin: 32px 0; border-radius: 4px; }
        .highlight p { margin: 0 0 8px 0; font-size: 15px; color: #166534; line-height: 1.6; }
        .highlight p:last-child { margin: 0; }
        .features { background: #f8fafc; padding: 24px; border-radius: 6px; margin: 32px 0; }
        .features h3 { font-size: 16px; font-weight: 600; color: #2d3748; margin: 0 0 16px 0; }
        .feature-list { list-style: none; padding: 0; margin: 0; }
        .feature-list li { padding: 8px 0 8px 28px; position: relative; color: #475569; font-size: 15px; }
        .feature-list li:before { content: '✓'; position: absolute; left: 0; color: #22c55e; font-weight: bold; font-size: 18px; }
        .button-container { text-align: center; margin: 40px 0; }
        .button { display: inline-block; padding: 16px 48px; background: #2d3748; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(45, 55, 72, 0.15); }
        .button:hover { background: #1a202c; box-shadow: 0 4px 8px rgba(45, 55, 72, 0.25); }
        .divider { height: 1px; background: #e5e7eb; margin: 32px 0; }
        .email-footer { background: #f8fafc; padding: 32px 48px; border-top: 1px solid #e5e7eb; }
        .footer-content { text-align: center; }
        .company-info { margin: 0 0 12px 0; }
        .company-name { font-size: 16px; font-weight: 600; color: #2d3748; margin: 0 0 4px 0; }
        .company-tagline { font-size: 13px; color: #64748b; margin: 0; }
        .footer-links { margin: 16px 0 0 0; }
        .footer-link { color: #4a5568; text-decoration: none; font-size: 13px; margin: 0 12px; }
        .footer-link:hover { color: #2d3748; text-decoration: underline; }
        .copyright { font-size: 12px; color: #94a3b8; margin: 16px 0 0 0; }
        @media only screen and (max-width: 600px) {
          .email-body { padding: 32px 24px; }
          .email-header { padding: 32px 24px; }
          .email-footer { padding: 24px; }
          .greeting { font-size: 20px; }
          .button { padding: 14px 32px; font-size: 15px; }
          .features { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          <div class="email-header">
            <img src="https://i.imgur.com/your-logo.png" alt="AccuCoder" class="logo" />
            <p class="header-title">Team Invitation</p>
          </div>
          <div class="email-body">
            <h1 class="greeting">You're Invited to AccuCoder</h1>
            <p class="message">Hello,</p>
            <p class="message">You've been invited to join AccuCoder, a comprehensive professional medical coding platform trusted by certified coders and healthcare organizations.</p>
            <div class="highlight">
              <p><strong>📧 Invitation Details:</strong></p>
              <p>Email: <strong>${email}</strong></p>
              <p>Click the button below to accept your invitation and create your secure password.</p>
            </div>
            <div class="button-container">
              <a href="${inviteUrl}" class="button">Accept Invitation</a>
            </div>
            <div class="features">
              <h3>What you'll get access to:</h3>
              <ul class="feature-list">
                <li>Comprehensive ICD-10-CM, CPT, and HCPCS code databases</li>
                <li>AI-powered coding assistant for accurate documentation</li>
                <li>Real-time code validation and compliance checking</li>
                <li>Professional coding resources and educational materials</li>
                <li>Secure collaboration tools for your healthcare team</li>
              </ul>
            </div>
            <div class="divider"></div>
            <p class="message" style="font-size: 14px; color: #64748b;">This invitation was sent to <strong>${email}</strong>. If you believe this was sent in error, you can safely ignore this email.</p>
          </div>
          <div class="email-footer">
            <div class="footer-content">
              <div class="company-info">
                <p class="company-name">AccuCoder</p>
                <p class="company-tagline">Professional Medical Coding Solutions</p>
              </div>
              <p class="copyright">&copy; ${new Date().getFullYear()} AccuCoder. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: "You're Invited to AccuCoder",
    html,
  })
}

export default transporter
