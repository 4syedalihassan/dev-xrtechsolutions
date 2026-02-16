// Global settings API for currency, signage, and other configurations
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '../../lib/supabase';
import { requireAdminAPI } from '../../lib/apiAuth';

// Check if Supabase is configured for API routes (uses service role key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Default settings to return when DB is not available
const defaultSettings = {
  currency: 'PKR',
  currency_symbol: 'Rs',
  tax_rate: 0,
  store_name: 'XR Tech Solutions',
  store_email: 'admin@xrtechsolutions.com',
  store_phone: '+92-XXX-XXXXXXX',
  store_logo: null
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Return defaults if Supabase is not configured
      if (!supabase) {
        return res.status(200).json(defaultSettings);
      }

      // Get platform settings from database
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('[Settings API] Database error (returning defaults):', error.message);
        return res.status(200).json(defaultSettings);
      }

      // If no settings exist yet, return defaults
      if (!data) {
        return res.status(200).json(defaultSettings);
      }

      // Map database fields to API response
      return res.status(200).json({
        currency: data.default_currency || 'PKR',
        currency_symbol: data.default_currency_symbol || 'Rs',
        tax_rate: data.default_tax_rate || 0,
        store_name: data.platform_name || 'XR Tech Solutions',
        store_email: data.platform_email || '',
        store_phone: data.platform_phone || '',
        store_logo: data.platform_logo || null,
        store_logo_dark: data.platform_logo_dark || null,
        store_logo_icon: data.platform_logo_icon || null,
        store_logo_email: data.platform_logo_email || null,
        favicon_url: data.favicon_url || null,
        theme_primary_color: data.theme_primary_color,
        theme_secondary_color: data.theme_secondary_color,
        theme_accent_color: data.theme_accent_color,
        social_media_links: data.social_media_links,
        tagline: data.tagline,
        signage: data.digital_signage || null,
        // Analytics settings
        google_analytics_enabled: data.google_analytics_enabled || false,
        google_analytics_id: data.google_analytics_id || null,
        google_analytics_measurement_id: data.google_analytics_measurement_id || null,
        google_adsense_enabled: data.google_adsense_enabled || false,
        google_adsense_publisher_id: data.google_adsense_publisher_id || null,
        google_adsense_auto_ads: data.google_adsense_auto_ads !== false,
        meta_pixel_enabled: data.meta_pixel_enabled || false,
        meta_pixel_id: data.meta_pixel_id || null,
        chat_enabled: data.chat_enabled !== false // Default to true if null/undefined
      });
    } catch (error) {
      console.warn('[Settings API] Failed to load settings (returning defaults):', error.message);
      return res.status(200).json(defaultSettings);
    }
  }

  if (req.method === 'PUT') {
    // Require admin authentication for updates
    const user = await requireAdminAPI(req, res);
    if (!user) return; // Response already sent by middleware

    try {
      const updates = req.body;
      console.log('[Settings API] PUT request received with updates:', updates);

      // Map API fields to database fields (only use columns that exist)
      const dbUpdates = {};

      if (updates.currency) {
        if (updates.currency.length !== 3) {
          return res.status(400).json({ error: 'Currency must be a 3-letter code (e.g., USD)' });
        }
        dbUpdates.default_currency = updates.currency.toUpperCase();
      }

      if (updates.currency_symbol) dbUpdates.default_currency_symbol = updates.currency_symbol;

      if (updates.tax_rate !== undefined) {
        const rate = parseFloat(updates.tax_rate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
          return res.status(400).json({ error: 'Tax rate must be a number between 0 and 100' });
        }
        dbUpdates.default_tax_rate = rate;
      }

      if (updates.store_name) {
        if (updates.store_name.length < 2) {
          return res.status(400).json({ error: 'Store name must be at least 2 characters' });
        }
        dbUpdates.platform_name = updates.store_name;
      }

      if (updates.store_email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.store_email)) {
          return res.status(400).json({ error: 'Invalid email format' });
        }
        dbUpdates.platform_email = updates.store_email;
      }

      if (updates.store_phone) dbUpdates.platform_phone = updates.store_phone;
      if (updates.store_logo !== undefined) dbUpdates.platform_logo = updates.store_logo;
      if (updates.store_logo_dark !== undefined) dbUpdates.platform_logo_dark = updates.store_logo_dark;
      if (updates.store_logo_icon !== undefined) dbUpdates.platform_logo_icon = updates.store_logo_icon;
      if (updates.store_logo_email !== undefined) dbUpdates.platform_logo_email = updates.store_logo_email;
      if (updates.favicon_url !== undefined) dbUpdates.favicon_url = updates.favicon_url;
      if (updates.signage !== undefined) dbUpdates.digital_signage = updates.signage;
      // Theme colors validation could be added here (hex regex), but relying on client color picker for now
      if (updates.theme_primary_color !== undefined) dbUpdates.theme_primary_color = updates.theme_primary_color;
      if (updates.theme_secondary_color !== undefined) dbUpdates.theme_secondary_color = updates.theme_secondary_color;
      if (updates.theme_accent_color !== undefined) dbUpdates.theme_accent_color = updates.theme_accent_color;

      // Analytics settings
      if (updates.google_analytics_enabled !== undefined) dbUpdates.google_analytics_enabled = updates.google_analytics_enabled;
      if (updates.google_analytics_id !== undefined) dbUpdates.google_analytics_id = updates.google_analytics_id;
      if (updates.google_analytics_measurement_id !== undefined) dbUpdates.google_analytics_measurement_id = updates.google_analytics_measurement_id;
      if (updates.google_adsense_enabled !== undefined) dbUpdates.google_adsense_enabled = updates.google_adsense_enabled;
      if (updates.google_adsense_publisher_id !== undefined) dbUpdates.google_adsense_publisher_id = updates.google_adsense_publisher_id;
      if (updates.google_adsense_auto_ads !== undefined) dbUpdates.google_adsense_auto_ads = updates.google_adsense_auto_ads;
      if (updates.meta_pixel_enabled !== undefined) dbUpdates.meta_pixel_enabled = updates.meta_pixel_enabled;
      if (updates.meta_pixel_id !== undefined) dbUpdates.meta_pixel_id = updates.meta_pixel_id;
      if (updates.chat_enabled !== undefined) dbUpdates.chat_enabled = updates.chat_enabled;

      console.log('[Settings API] Mapped database updates:', dbUpdates);

      // Check if settings row exists
      const { data: existing } = await supabase
        .from('platform_settings')
        .select('id')
        .single();

      let result;
      if (existing) {
        console.log('[Settings API] Updating existing settings row:', existing.id);
        // Update existing row
        result = await supabase
          .from('platform_settings')
          .update(dbUpdates)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        console.log('[Settings API] Inserting new settings row');
        // Insert new row
        result = await supabase
          .from('platform_settings')
          .insert(dbUpdates)
          .select()
          .single();
      }

      if (result.error) {
        console.error('[Settings API] Database operation error:', result.error);
        throw result.error;
      }

      console.log('[Settings API] Settings saved successfully:', {
        id: result.data.id,
        store_logo: result.data.platform_logo
      });

      // Return updated settings
      const data = result.data;
      return res.status(200).json({
        success: true,
        settings: {
          currency: data.default_currency,
          currency_symbol: data.default_currency_symbol,
          tax_rate: data.default_tax_rate,
          store_name: data.platform_name,
          store_email: data.platform_email,
          store_phone: data.platform_phone,
          store_logo: data.platform_logo,
          store_logo_dark: data.platform_logo_dark,
          store_logo_icon: data.platform_logo_icon,
          store_logo_email: data.platform_logo_email,
          favicon_url: data.favicon_url,
          signage: data.digital_signage,
          theme_primary_color: data.theme_primary_color,
          theme_secondary_color: data.theme_secondary_color,
          theme_accent_color: data.theme_accent_color,
          chat_enabled: data.chat_enabled
        }
      });
    } catch (error) {
      console.error('[Settings API] Failed to update settings:', error);
      return res.status(500).json({ error: 'Failed to update settings', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
