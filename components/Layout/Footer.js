import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';

export default function Footer() {
  const [settings, setSettings] = useState(null);
  const [footerSections, setFooterSections] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    loadSettings();
    loadFooterContent();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Settings API error');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSettings({
        store_name: '',
        tagline: 'Immersive Shopping Experience',
        social_media_links: {
          facebook: '',
          instagram: '',
          twitter: '',
          linkedin: ''
        }
      });
    }
  };

  const loadFooterContent = async () => {
    try {
      const response = await fetch('/api/footer');
      if (!response.ok) throw new Error('Footer API error');
      const data = await response.json();
      setFooterSections(data.sections || []);
    } catch (error) {
      console.error('Failed to load footer content:', error);
      // Fallback to default footer structure
      setFooterSections([
        {
          id: '1',
          heading: 'About Us',
          display_order: 1,
          links: [
            { id: '1', label: 'Our Story', url: '/about', target: 'internal' },
            { id: '2', label: 'Careers', url: '/careers', target: 'internal' },
            { id: '3', label: 'Press', url: '/press', target: 'internal' }
          ]
        },
        {
          id: '2',
          heading: 'Customer Service',
          display_order: 2,
          links: [
            { id: '4', label: 'Contact Us', url: '/contact', target: 'internal' },
            { id: '5', label: 'Shipping Info', url: '/shipping', target: 'internal' },
            { id: '6', label: 'Returns & Refunds', url: '/returns', target: 'internal' },
            { id: '7', label: 'FAQ', url: '/faq', target: 'internal' }
          ]
        },
        {
          id: '3',
          heading: 'Legal',
          display_order: 3,
          links: [
            { id: '8', label: 'Terms of Service', url: '/terms', target: 'internal' },
            { id: '9', label: 'Privacy Policy', url: '/privacy', target: 'internal' },
            { id: '10', label: 'Refund Policy', url: '/refund-policy', target: 'internal' }
          ]
        }
      ]);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsSubscribing(true);
    setNewsletterStatus('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
        setTimeout(() => setNewsletterStatus(''), 5000);
      } else {
        setNewsletterStatus('error');
        console.error('Newsletter subscription failed:', data.error);
      }
    } catch (error) {
      setNewsletterStatus('error');
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const socialMediaLinks = settings?.social_media_links || {};

  return (
    <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">

          {/* Column 1: Branding & Social (Left - 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <Link href="/" className="inline-block">
                {settings?.store_logo || settings?.store_logo_dark ? (
                  <>
                    {settings?.store_logo && (
                      <img
                        src={settings.store_logo}
                        alt={settings.store_name || ''}
                        className="h-10 w-auto object-contain dark:hidden"
                      />
                    )}
                    {settings?.store_logo_dark ? (
                      <img
                        src={settings.store_logo_dark}
                        alt={settings.store_name || ''}
                        className="h-12 w-auto object-contain hidden dark:block"
                      />
                    ) : settings?.store_logo && (
                      <img
                        src={settings.store_logo}
                        alt={settings.store_name || ''}
                        className="h-12 w-auto object-contain hidden dark:block"
                      />
                    )}
                  </>
                ) : (
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                    {settings?.store_name || ''}
                  </span>
                )}
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400 max-w-sm">
                {settings?.tagline || 'Experience the future of shopping with our immersive 3D virtual store. Quality products, next-gen technology.'}
              </p>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center space-x-4">
              {socialMediaLinks.facebook && (
                <SocialLink href={socialMediaLinks.facebook} label="Facebook" icon={<FaFacebook />} color="hover:text-blue-600" />
              )}
              {socialMediaLinks.instagram && (
                <SocialLink href={socialMediaLinks.instagram} label="Instagram" icon={<FaInstagram />} color="hover:text-pink-600" />
              )}
              {socialMediaLinks.twitter && (
                <SocialLink href={socialMediaLinks.twitter} label="Twitter" icon={<FaTwitter />} color="hover:text-blue-400" />
              )}
              {socialMediaLinks.linkedin && (
                <SocialLink href={socialMediaLinks.linkedin} label="LinkedIn" icon={<FaLinkedin />} color="hover:text-blue-700" />
              )}
            </div>
          </div>

          {/* Columns 2-3: Navigation Links (Middle - 5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {footerSections
              .filter(section => section.heading !== 'Follow Us') // We display social links separately
              .sort((a, b) => a.display_order - b.display_order)
              .map((section) => (
                <div key={section.id}>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                    {section.heading}
                  </h3>
                  <ul className="space-y-3">
                    {section.links?.map((link) => (
                      <li key={link.id}>
                        {link.target === 'external' || link.target === 'new_tab' ? (
                          <a
                            href={link.url}
                            target={link.target === 'new_tab' ? '_blank' : '_self'}
                            rel={link.target === 'new_tab' ? 'noopener noreferrer' : undefined}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.url}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>

          {/* Column 4: Newsletter (Right - 3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Stay Updated
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Subscribe to our newsletter for the latest 3D drops and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  aria-label="Email address for newsletter"
                />
              </div>
              <button
                type="submit"
                disabled={isSubscribing}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>

              {newsletterStatus === 'success' && (
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-2 animate-fade-in">
                  <span className="mr-1">✓</span> Thanks for subscribing!
                </p>
              )}
              {newsletterStatus === 'error' && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-2 animate-fade-in">
                  <span className="mr-1">✗</span> Something went wrong.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center md:text-left">
            &copy; {currentYear} {settings?.store_name || 'XR Tech Solutions'}. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Secure Payment</span>
            <div className="flex gap-2">
              <PaymentBadge icon={<FaMoneyBillWave />} label="COD" />
              <PaymentBadge icon={<FaCreditCard />} label="Bank Transfer" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Helper Components
function SocialLink({ href, label, icon, color }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ${color} hover:bg-white dark:hover:bg-gray-700 shadow-sm hover:shadow transition-all duration-200`}
      aria-label={label}
    >
      <span className="text-lg">{icon}</span>
    </a>
  );
}

function PaymentBadge({ icon, label }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-300">
      {icon}
      <span>{label}</span>
    </div>
  );
}
