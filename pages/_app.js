import '../styles/globals.css';
import '../styles/unified-theme.css';
import '../styles/admin.css';
import Head from 'next/head';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { RadioProvider } from '../contexts/RadioContext';
import { WishlistProvider } from '../contexts/WishlistContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import AnalyticsProvider from '../components/Analytics/AnalyticsProvider';
import ChatWidget from '../components/Support/ChatWidget';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Viewport and Mobile Optimization */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        
        {/* Primary Meta Tags */}
        <title>XR Tech Solutions - 3D Immersive Shopping Experience | WebXR E-Commerce</title>
        <meta name="title" content="XR Tech Solutions - 3D Immersive Shopping Experience | WebXR E-Commerce" />
        <meta name="description" content="Experience the future of online shopping with XR Tech Solutions. Shop in our revolutionary 3D virtual store with immersive WebXR technology. Browse healthcare products, perfumes, and more in an interactive 3D environment." />
        <meta name="keywords" content="3D shopping, virtual store, WebXR, immersive shopping, VR shopping, AR shopping, online store, e-commerce, 3D e-commerce, virtual reality shopping, augmented reality, XR technology, healthcare products, perfumes, interactive shopping" />
        
        {/* Open Graph / Facebook Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://xrtechsolutions.com/" />
        <meta property="og:title" content="XR Tech Solutions - 3D Immersive Shopping Experience" />
        <meta property="og:description" content="Shop in our revolutionary 3D virtual store with immersive WebXR technology. Experience the future of online shopping today!" />
        <meta property="og:image" content="https://xrtechsolutions.com/logos/logo-primary.svg" />
        <meta property="og:site_name" content="XR Tech Solutions" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://xrtechsolutions.com/" />
        <meta name="twitter:title" content="XR Tech Solutions - 3D Immersive Shopping Experience" />
        <meta name="twitter:description" content="Shop in our revolutionary 3D virtual store with immersive WebXR technology. Experience the future of online shopping!" />
        <meta name="twitter:image" content="https://xrtechsolutions.com/logos/logo-primary.svg" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="XR Tech Solutions" />
        <meta name="application-name" content="XR Tech Solutions" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicons/favicon.svg" type="image/svg+xml" />
      </Head>

      {/* Analytics tracking - Google Analytics, AdSense, Meta Pixel */}
      <AnalyticsProvider />

      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <RadioProvider>
                <Component {...pageProps} />
                {/* Chat Support Widget */}
                <ChatWidget />
                {/* Vercel Speed Insights */}
                <SpeedInsights />
                {/* Vercel Web Analytics */}
                <Analytics />
              </RadioProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </>
  );
}

export default MyApp;
