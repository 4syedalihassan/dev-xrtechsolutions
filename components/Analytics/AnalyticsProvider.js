import { useState, useEffect } from 'react';
import GoogleAnalytics from './GoogleAnalytics';
import GoogleAdSense from './GoogleAdSense';
import MetaPixel from './MetaPixel';

export default function AnalyticsProvider() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load analytics settings from API
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        console.log('[AnalyticsProvider] Settings loaded:', {
          google_analytics_enabled: data.google_analytics_enabled,
          google_analytics_measurement_id: data.google_analytics_measurement_id,
          google_analytics_id: data.google_analytics_id,
          google_adsense_enabled: data.google_adsense_enabled,
          meta_pixel_enabled: data.meta_pixel_enabled
        });
        setSettings(data);
      } catch (error) {
        console.error('[AnalyticsProvider] Failed to load analytics settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Don't render anything while loading
  if (loading || !settings) {
    return null;
  }

  return (
    <>
      {/* Google Analytics */}
      {settings.google_analytics_enabled && (
        <GoogleAnalytics
          measurementId={settings.google_analytics_measurement_id}
          trackingId={settings.google_analytics_id}
        />
      )}
      {!settings.google_analytics_enabled && console.log('[AnalyticsProvider] Google Analytics is disabled')}
      {settings.google_analytics_enabled && !settings.google_analytics_measurement_id && console.log('[AnalyticsProvider] Google Analytics enabled but no measurement ID provided')}

      {/* Google AdSense */}
      {settings.google_adsense_enabled && settings.google_adsense_publisher_id && (
        <GoogleAdSense
          publisherId={settings.google_adsense_publisher_id}
          autoAds={settings.google_adsense_auto_ads}
        />
      )}

      {/* Meta Pixel */}
      {settings.meta_pixel_enabled && settings.meta_pixel_id && (
        <MetaPixel pixelId={settings.meta_pixel_id} />
      )}
    </>
  );
}
