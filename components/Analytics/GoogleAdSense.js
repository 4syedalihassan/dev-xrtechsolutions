import Script from 'next/script';

export default function GoogleAdSense({ publisherId, autoAds = true }) {
  // If no publisher ID provided, don't render anything
  if (!publisherId) {
    return null;
  }

  return (
    <>
      {autoAds && (
        <Script
          id="google-adsense-auto"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
          crossOrigin="anonymous"
        />
      )}
    </>
  );
}

// Component for displaying individual ad units
export function AdUnit({
  slot,
  format = 'auto',
  responsive = true,
  style = { display: 'block' }
}) {
  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive.toString()}
    />
  );
}

// Helper function to push ads after component mount
export const pushAd = () => {
  if (typeof window !== 'undefined' && window.adsbygoogle) {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }
};

// Responsive ad component with automatic initialization
export function ResponsiveAd({ slot, className }) {
  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// In-article ad component
export function InArticleAd({ slot }) {
  return (
    <div style={{ textAlign: 'center', margin: '2rem 0' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
      />
    </div>
  );
}

// In-feed ad component
export function InFeedAd({ slot, layoutKey }) {
  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-format="fluid"
      data-ad-layout-key={layoutKey}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
      data-ad-slot={slot}
    />
  );
}
