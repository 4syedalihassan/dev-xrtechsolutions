// Dynamic sitemap generator
// Generates sitemap.xml with current date for lastmod tags

// Cache configuration (in seconds)
const CACHE_MAX_AGE = 3600; // 1 hour
const STALE_WHILE_REVALIDATE = 7200; // 2 hours

export default function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    // Get current date in YYYY-MM-DD format (UTC timezone for consistency)
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Base URL for the site (dynamically determined from request headers)
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'xrtechsolutions.com';
    const baseUrl = `${protocol}://${host}`;

    // Define static pages with their metadata
    const staticPages = [
      {
        loc: '/',
        changefreq: 'daily',
        priority: '1.0',
        lastmod: currentDate
      },
      {
        loc: '/products',
        changefreq: 'daily',
        priority: '0.9',
        lastmod: currentDate
      },
      {
        loc: '/immersiveexp',
        changefreq: 'weekly',
        priority: '0.9',
        lastmod: currentDate
      },
      {
        loc: '/help',
        changefreq: 'monthly',
        priority: '0.7',
        lastmod: currentDate
      },
      {
        loc: '/track-order',
        changefreq: 'monthly',
        priority: '0.6',
        lastmod: currentDate
      }
    ];

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${staticPages.map(page => `  <!-- ${getPageTitle(page.loc)} -->
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  <!--
    NOTE: This is a dynamically generated sitemap with current date.
    Future enhancement: Add product URLs from database for complete coverage.
  -->
</urlset>`;

    // Set appropriate headers for XML
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`);
    
    return res.status(200).send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(500).send(`<?xml version="1.0"?><error>Failed to generate sitemap</error>`);
  }
}

// Helper function to get page titles for comments
function getPageTitle(path) {
  const titles = {
    '/': 'Homepage',
    '/products': 'Products Listing',
    '/immersiveexp': 'Immersive Experience',
    '/help': 'Help/Support',
    '/track-order': 'Track Order'
  };
  return titles[path] || path;
}
