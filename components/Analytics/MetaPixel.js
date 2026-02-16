import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';

export default function MetaPixel({ pixelId }) {
  const router = useRouter();

  useEffect(() => {
    // Track page views on route change
    const handleRouteChange = () => {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'PageView');
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // If no pixel ID provided, don't render anything
  if (!pixelId) {
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Helper function to track custom events
export const trackMetaEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
};

// Helper function to track standard events
export const trackViewContent = (contentName, contentCategory, value, currency = 'USD') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: contentName,
      content_category: contentCategory,
      value: value,
      currency: currency,
    });
  }
};

export const trackAddToCart = (contentName, contentId, value, currency = 'USD') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: contentName,
      content_ids: [contentId],
      value: value,
      currency: currency,
    });
  }
};

export const trackInitiateCheckout = (value, currency = 'USD', numItems) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: value,
      currency: currency,
      num_items: numItems,
    });
  }
};

export const trackPurchase = (value, currency = 'USD', contentIds, contentType = 'product') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: value,
      currency: currency,
      content_ids: contentIds,
      content_type: contentType,
    });
  }
};

export const trackSearch = (searchString, value, currency = 'USD') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Search', {
      search_string: searchString,
      value: value,
      currency: currency,
    });
  }
};

export const trackLead = (contentName, value, currency = 'USD') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: contentName,
      value: value,
      currency: currency,
    });
  }
};

export const trackCompleteRegistration = (status, value, currency = 'USD') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      status: status,
      value: value,
      currency: currency,
    });
  }
};
