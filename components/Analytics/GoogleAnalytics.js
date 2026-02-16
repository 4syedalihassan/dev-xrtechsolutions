import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';

export default function GoogleAnalytics({ measurementId, trackingId }) {
  const router = useRouter();

  useEffect(() => {
    // Track page views on route change (for GA4)
    const handleRouteChange = (url) => {
      if (typeof window !== 'undefined' && window.gtag && measurementId) {
        window.gtag('config', measurementId, {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, measurementId]);

  // If no IDs provided, don't render anything
  if (!measurementId && !trackingId) {
    console.log('[GoogleAnalytics] No measurement ID or tracking ID provided');
    return null;
  }

  console.log('[GoogleAnalytics] Rendering with:', { measurementId, trackingId });

  return (
    <>
      {/* Google Analytics 4 (GA4) - Recommended */}
      {measurementId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
          />
          <Script
            id="google-analytics-ga4"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${measurementId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      {/* Universal Analytics (Legacy) - Optional */}
      {trackingId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.google-analytics.com/analytics.js`}
          />
          <Script
            id="google-analytics-ua"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
                ga('create', '${trackingId}', 'auto');
                ga('send', 'pageview');
              `,
            }}
          />
        </>
      )}
    </>
  );
}

// Helper function to track custom events
export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Helper function to track page views manually
export const trackPageView = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Helper function to track e-commerce events
export const trackPurchase = (transactionId, value, currency, items) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency || 'USD',
      items: items,
    });
  }
};

// Helper function to track product views
export const trackProductView = (productId, productName, category, price) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      items: [
        {
          item_id: productId,
          item_name: productName,
          item_category: category,
          price: price,
        },
      ],
    });
  }
};

// Helper function to track add to cart
export const trackAddToCart = (productId, productName, category, price, quantity) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      items: [
        {
          item_id: productId,
          item_name: productName,
          item_category: category,
          price: price,
          quantity: quantity || 1,
        },
      ],
    });
  }
};

// Helper function to track begin checkout
export const trackBeginCheckout = (value, currency, items) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      value: value,
      currency: currency || 'USD',
      items: items,
    });
  }
};
