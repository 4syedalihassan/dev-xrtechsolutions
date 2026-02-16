import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Basic Meta Tags */}
        <meta charSet="UTF-8" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="author" content="XR Tech Solutions" />
        
        {/* Geo Tags */}
        <meta name="geo.region" content="PK" />
        <meta name="geo.placename" content="Pakistan" />
        
        {/* Favicons */}
        <link rel="icon" href="/favicons/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicons/favicon.svg" />
        
        {/* Canonical URL - will be overridden per page */}
        <link rel="canonical" href="https://xrtechsolutions.com/" />
        
        {/* JSON-LD Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'XR Tech Solutions',
              description: 'Revolutionary 3D immersive shopping experience with WebXR technology',
              url: 'https://xrtechsolutions.com',
              logo: 'https://xrtechsolutions.com/logos/logo-primary.svg',
              sameAs: [
                'https://www.facebook.com/xrtechsolutions',
                'https://twitter.com/xrtechsolutions',
                'https://www.linkedin.com/company/xrtechsolutions'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                availableLanguage: ['en', 'ur']
              }
            })
          }}
        />
        
        {/* JSON-LD Structured Data for Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'XR Tech Solutions',
              url: 'https://xrtechsolutions.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://xrtechsolutions.com/products?search={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}