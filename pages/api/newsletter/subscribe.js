import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email } = req.body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_subscribed')
      .eq('email', email.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing subscriber:', checkError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (existing) {
      // If already subscribed, return success
      if (existing.is_subscribed) {
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed to our newsletter'
        });
      }

      // If previously unsubscribed, resubscribe
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({
          is_subscribed: true,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Error resubscribing:', updateError);
        return res.status(500).json({ error: 'Failed to resubscribe' });
      }

      return res.status(200).json({
        success: true,
        message: 'Successfully resubscribed to newsletter'
      });
    }

    // Create new subscriber
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email: email.toLowerCase(),
          is_subscribed: true,
          subscribed_at: new Date().toISOString()
        }
      ]);

    if (insertError) {
      console.error('Error creating subscriber:', insertError);
      return res.status(500).json({ error: 'Failed to subscribe' });
    }

    // TODO: Send welcome email to subscriber

    return res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
