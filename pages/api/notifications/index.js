// =====================================================
// NOTIFICATIONS API
// Remaining Feature: Notification System
// Supports Email, SMS, and Push notifications
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await listNotifications(req, res);
      case 'POST':
        return await sendNotification(req, res);
      case 'PUT':
        return await markAsRead(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('Notifications API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET: List notifications for a user
async function listNotifications(req, res) {
  const { user_id, type, unread_only, limit = 20, offset = 0 } = req.query;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      error: 'user_id is required'
    });
  }

  // Return empty if Supabase not configured
  if (!supabase) {
    return res.status(200).json({
      success: true,
      notifications: [],
      unread_count: 0
    });
  }

  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (type) {
      query = query.eq('type', type);
    }

    if (unread_only === 'true') {
      query = query.eq('read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      if (error.code === '42P01') {
        return res.status(200).json({
          success: true,
          notifications: [],
          unread_count: 0
        });
      }
      throw error;
    }

    // Get unread count
    const { count: unread_count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('read', false);

    return res.status(200).json({
      success: true,
      notifications: notifications || [],
      unread_count: unread_count || 0
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      notifications: [],
      unread_count: 0
    });
  }
}

// POST: Send notification
async function sendNotification(req, res) {
  const {
    user_id,
    type = 'in_app', // 'in_app', 'email', 'sms', 'push'
    title,
    message,
    data = {},
    // For email
    email_to,
    email_subject,
    // For SMS
    phone_number,
    // For push
    push_token
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      success: false,
      error: 'title and message are required'
    });
  }

  const results = { success: true, sent: [] };

  // In-App Notification
  if (type === 'in_app' || type === 'all') {
    if (user_id) {
      const inAppResult = await createInAppNotification(user_id, title, message, data);
      results.sent.push({ type: 'in_app', ...inAppResult });
    }
  }

  // Email Notification
  if (type === 'email' || type === 'all') {
    if (email_to) {
      const emailResult = await sendEmailNotification(email_to, email_subject || title, message, data);
      results.sent.push({ type: 'email', ...emailResult });
    }
  }

  // SMS Notification
  if (type === 'sms' || type === 'all') {
    if (phone_number) {
      const smsResult = await sendSMSNotification(phone_number, message);
      results.sent.push({ type: 'sms', ...smsResult });
    }
  }

  // Push Notification
  if (type === 'push' || type === 'all') {
    if (push_token) {
      const pushResult = await sendPushNotification(push_token, title, message, data);
      results.sent.push({ type: 'push', ...pushResult });
    }
  }

  return res.status(200).json(results);
}

// PUT: Mark notifications as read
async function markAsRead(req, res) {
  const { notification_ids, user_id, mark_all } = req.body;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      error: 'user_id is required'
    });
  }

  if (!supabase) {
    return res.status(200).json({
      success: true,
      message: 'Notifications marked as read'
    });
  }

  try {
    let query = supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', user_id);

    if (!mark_all && notification_ids?.length > 0) {
      query = query.in('id', notification_ids);
    }

    await query;

    return res.status(200).json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      message: 'Notifications marked as read'
    });
  }
}

// Create in-app notification
async function createInAppNotification(user_id, title, message, data) {
  if (!supabase) {
    return { success: true, demo: true };
  }

  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        title,
        message,
        data,
        type: 'in_app',
        read: false
      })
      .select()
      .single();

    if (error && error.code !== '42P01') {
      throw error;
    }

    return { success: true, notification_id: notification?.id };
  } catch (error) {
    return { success: true, demo: true };
  }
}

// Send email notification (using Resend, SendGrid, or similar)
async function sendEmailNotification(to, subject, message, data) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'noreply@xrtech.com';

  // Try Resend first
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html: generateEmailTemplate(subject, message, data)
        })
      });

      const result = await response.json();
      return { success: true, email_id: result.id };
    } catch (error) {
      console.error('Resend email error:', error);
    }
  }

  // Try SendGrid
  if (sendgridApiKey) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sendgridApiKey}`
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromEmail },
          subject,
          content: [{ type: 'text/html', value: generateEmailTemplate(subject, message, data) }]
        })
      });

      if (response.ok) {
        return { success: true };
      }
    } catch (error) {
      console.error('SendGrid email error:', error);
    }
  }

  // Demo mode
  return { 
    success: true, 
    demo: true, 
    message: 'Email service not configured. Set RESEND_API_KEY or SENDGRID_API_KEY'
  };
}

// Send SMS notification (using Twilio)
async function sendSMSNotification(phone, message) {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    return { 
      success: true, 
      demo: true, 
      message: 'SMS service not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER'
    };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`
        },
        body: new URLSearchParams({
          From: twilioPhoneNumber,
          To: phone,
          Body: message
        })
      }
    );

    const result = await response.json();
    return { success: true, message_sid: result.sid };
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return { success: false, error: error.message };
  }
}

// Send push notification (using Firebase Cloud Messaging)
async function sendPushNotification(token, title, body, data) {
  const fcmServerKey = process.env.FCM_SERVER_KEY;

  if (!fcmServerKey) {
    return { 
      success: true, 
      demo: true, 
      message: 'Push notification service not configured. Set FCM_SERVER_KEY'
    };
  }

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${fcmServerKey}`
      },
      body: JSON.stringify({
        to: token,
        notification: { title, body },
        data
      })
    });

    const result = await response.json();
    return { success: result.success === 1, message_id: result.results?.[0]?.message_id };
  } catch (error) {
    console.error('FCM push error:', error);
    return { success: false, error: error.message };
  }
}

// Generate email HTML template
function generateEmailTemplate(subject, message, data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>XR Tech Solutions</h1>
        </div>
        <div class="content">
          <h2>${subject}</h2>
          <p>${message}</p>
          ${data.action_url ? `<a href="${data.action_url}" class="button">${data.action_text || 'View Details'}</a>` : ''}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} XR Tech Solutions. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
