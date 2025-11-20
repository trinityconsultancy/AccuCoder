// Email Worker - Background email processing system
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
const supabase = createClient(supabaseUrl, supabaseServiceKey)

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ Email Worker: Supabase credentials not configured')
}

export interface EmailJob {
  id: string
  to: string
  subject: string
  message: string
  template?: string
  template_data?: Record<string, any>
  status: 'pending' | 'sending' | 'sent' | 'failed'
  attempts: number
  max_attempts: number
  scheduled_for?: string
  sent_at?: string
  error?: string
  created_at: string
  updated_at: string
}

export class EmailWorker {
  private isRunning = false
  private pollInterval = 5000 // 5 seconds
  private maxConcurrent = 5
  
  constructor() {
    console.log('Email Worker initialized')
  }

  // Start the worker
  async start() {
    if (this.isRunning) {
      console.log('Email Worker already running')
      return
    }

    this.isRunning = true
    console.log('Email Worker started')
    
    // Start processing loop
    this.processLoop()
  }

  // Stop the worker
  stop() {
    this.isRunning = false
    console.log('Email Worker stopped')
  }

  // Main processing loop
  private async processLoop() {
    while (this.isRunning) {
      try {
        await this.processPendingEmails()
        await this.sleep(this.pollInterval)
      } catch (error) {
        console.error('Error in email worker loop:', error)
        await this.sleep(this.pollInterval)
      }
    }
  }

  // Process pending emails
  private async processPendingEmails() {
    try {
      // Get pending emails
      const { data: pendingEmails, error } = await supabase
        .from('email_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .lt('attempts', 3)
        .order('created_at', { ascending: true })
        .limit(this.maxConcurrent)

      if (error) throw error
      if (!pendingEmails || pendingEmails.length === 0) return

      console.log(`Processing ${pendingEmails.length} pending emails`)

      // Process emails in parallel
      await Promise.all(
        pendingEmails.map(email => this.processEmail(email))
      )
    } catch (error) {
      console.error('Error processing pending emails:', error)
    }
  }

  // Process individual email
  private async processEmail(email: EmailJob) {
    try {
      // Update status to sending
      await this.updateEmailStatus(email.id, 'sending')

      // Generate email content
      const emailContent = await this.generateEmailContent(email)

      // Send email (integrate with your email provider)
      await this.sendEmail({
        to: email.to,
        subject: email.subject,
        html: emailContent,
        text: this.stripHtml(emailContent)
      })

      // Update status to sent
      await this.updateEmailStatus(email.id, 'sent', {
        sent_at: new Date().toISOString()
      })

      console.log(`Email sent successfully to ${email.to}`)
    } catch (error: any) {
      console.error(`Error sending email to ${email.to}:`, error)
      
      // Update failure status
      await this.updateEmailStatus(email.id, 'failed', {
        attempts: email.attempts + 1,
        error: error.message
      })

      // Retry logic
      if (email.attempts + 1 < email.max_attempts) {
        // Reschedule for retry (exponential backoff)
        const retryDelay = Math.pow(2, email.attempts) * 60 * 1000 // 1min, 2min, 4min
        const scheduledFor = new Date(Date.now() + retryDelay).toISOString()
        
        await supabase
          .from('email_queue')
          .update({ 
            status: 'pending',
            scheduled_for: scheduledFor
          })
          .eq('id', email.id)
      }
    }
  }

  // Update email status
  private async updateEmailStatus(
    id: string, 
    status: EmailJob['status'],
    additionalData?: Partial<EmailJob>
  ) {
    await supabase
      .from('email_queue')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...additionalData
      })
      .eq('id', id)
  }

  // Generate email content from template
  private async generateEmailContent(email: EmailJob): Promise<string> {
    if (email.template && email.template_data) {
      return this.applyTemplate(email.template, email.template_data)
    }
    
    // Default email template
    return this.getDefaultTemplate(email.subject, email.message)
  }

  // Apply email template
  private applyTemplate(template: string, data: Record<string, any>): string {
    let content = this.getEmailTemplate(template)
    
    // Replace placeholders
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`{{${key}}}`, 'g')
      content = content.replace(placeholder, data[key])
    })
    
    return content
  }

  // Get email template by name
  private getEmailTemplate(templateName: string): string {
    const templates: Record<string, string> = {
      welcome: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to AccuCoder!</h1>
          <p>Hi {{firstName}},</p>
          <p>Thank you for joining AccuCoder. We're excited to have you on board!</p>
          <p>Your account has been successfully created. You can now access all our medical coding tools and resources.</p>
          <div style="margin: 30px 0;">
            <a href="{{loginUrl}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Get Started
            </a>
          </div>
          <p>Best regards,<br>The AccuCoder Team</p>
        </div>
      `,
      
      roleChanged: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Your Role Has Been Updated</h1>
          <p>Hi {{firstName}},</p>
          <p>Your role in AccuCoder has been updated to: <strong>{{newRole}}</strong></p>
          <p>This change was made by an administrator on {{date}}.</p>
          <p>If you have any questions about this change, please contact our support team.</p>
          <p>Best regards,<br>The AccuCoder Team</p>
        </div>
      `,
      
      passwordReset: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Reset Your Password</h1>
          <p>Hi {{firstName}},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="margin: 30px 0;">
            <a href="{{resetUrl}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The AccuCoder Team</p>
        </div>
      `,
      
      accountDeleted: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Account Deleted</h1>
          <p>Hi {{firstName}},</p>
          <p>Your AccuCoder account has been deleted by an administrator.</p>
          <p>If you believe this was done in error, please contact our support team immediately.</p>
          <p>Best regards,<br>The AccuCoder Team</p>
        </div>
      `,
      
      adminNotification: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Admin Notification</h1>
          <p>Hi {{firstName}},</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            {{message}}
          </div>
          <p>Best regards,<br>The AccuCoder Team</p>
        </div>
      `
    }

    return templates[templateName] || templates.adminNotification
  }

  // Default email template
  private getDefaultTemplate(subject: string, message: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AccuCoder</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Medical Coding Platform</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin-top: 0;">${subject}</h2>
            <div style="color: #4b5563; line-height: 1.6; white-space: pre-wrap;">
              ${message}
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              © ${new Date().getFullYear()} AccuCoder. All rights reserved.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              You received this email because you have an account with AccuCoder.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Send email via provider (integrate with SendGrid, AWS SES, etc.)
  private async sendEmail(params: {
    to: string
    subject: string
    html: string
    text: string
  }) {
    // TODO: Integrate with actual email provider
    // Example for SendGrid:
    /*
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    
    await sgMail.send({
      to: params.to,
      from: 'noreply@accucoder.com',
      subject: params.subject,
      text: params.text,
      html: params.html
    })
    */

    // For now, just log
    console.log('Email sent:', {
      to: params.to,
      subject: params.subject,
      preview: params.text.substring(0, 100) + '...'
    })

    // Simulate sending delay
    await this.sleep(1000)
  }

  // Strip HTML tags
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Sleep utility
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Singleton instance
let emailWorkerInstance: EmailWorker | null = null

export function getEmailWorker(): EmailWorker {
  if (!emailWorkerInstance) {
    emailWorkerInstance = new EmailWorker()
  }
  return emailWorkerInstance
}

// Helper function to queue an email
export async function queueEmail(params: {
  to: string
  subject: string
  message: string
  template?: string
  template_data?: Record<string, any>
  scheduled_for?: Date
}) {
  try {
    const { data, error } = await supabase
      .from('email_queue')
      .insert({
        to: params.to,
        subject: params.subject,
        message: params.message,
        template: params.template,
        template_data: params.template_data,
        status: 'pending',
        attempts: 0,
        max_attempts: 3,
        scheduled_for: params.scheduled_for?.toISOString() || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error queueing email:', error)
    throw error
  }
}

// Helper function to send immediate email (bypasses queue)
export async function sendImmediateEmail(params: {
  to: string
  subject: string
  message: string
}) {
  const worker = getEmailWorker()
  const email: EmailJob = {
    id: crypto.randomUUID(),
    to: params.to,
    subject: params.subject,
    message: params.message,
    status: 'pending',
    attempts: 0,
    max_attempts: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  await (worker as any).processEmail(email)
}
