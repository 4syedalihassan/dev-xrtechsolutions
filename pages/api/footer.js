import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// Default footer sections to return when DB is not available
const defaultSections = [
  {
    id: '1',
    title: 'Quick Links',
    display_order: 1,
    links: [
      { id: '1', label: 'Home', url: '/', display_order: 1 },
      { id: '2', label: 'Products', url: '/products', display_order: 2 },
      { id: '3', label: 'Categories', url: '/categories', display_order: 3 },
      { id: '4', label: 'VR Experience', url: '/immersiveexp', display_order: 4 }
    ]
  },
  {
    id: '2',
    title: 'Customer Service',
    display_order: 2,
    links: [
      { id: '5', label: 'Contact Us', url: '/contact', display_order: 1 },
      { id: '6', label: 'FAQ', url: '/faq', display_order: 2 },
      { id: '7', label: 'Shipping Info', url: '/shipping', display_order: 3 },
      { id: '8', label: 'Returns', url: '/returns', display_order: 4 }
    ]
  },
  {
    id: '3',
    title: 'About',
    display_order: 3,
    links: [
      { id: '9', label: 'About Us', url: '/about', display_order: 1 },
      { id: '10', label: 'Privacy Policy', url: '/privacy', display_order: 2 },
      { id: '11', label: 'Terms of Service', url: '/terms', display_order: 3 }
    ]
  }
];

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getFooterContent(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.warn('Footer API error (returning defaults):', error.message);
    return res.status(200).json({ success: true, sections: defaultSections });
  }
}

// GET /api/footer - Fetch all footer sections with links
async function getFooterContent(req, res) {
  // Return defaults if Supabase is not configured
  if (!isSupabaseConfigured()) {
    return res.status(200).json({ success: true, sections: defaultSections });
  }

  try {
    // Fetch all visible footer sections
    const { data: sections, error: sectionsError } = await supabase
      .from('footer_sections')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (sectionsError) {
      console.warn('Error fetching footer sections (returning defaults):', sectionsError.message);
      return res.status(200).json({ success: true, sections: defaultSections });
    }

    // Fetch all visible footer links
    const { data: links, error: linksError } = await supabase
      .from('footer_links')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (linksError) {
      console.warn('Error fetching footer links:', linksError.message);
      // If links table doesn't exist, return sections without links
      return res.status(200).json({ success: true, sections: sections || [] });
    }

    // Organize links by section
    const sectionsWithLinks = sections.map((section) => ({
      ...section,
      links: links.filter((link) => link.section_id === section.id)
    }));

    return res.status(200).json({
      success: true,
      sections: sectionsWithLinks || []
    });
  } catch (error) {
    console.warn('Get footer content error (returning defaults):', error.message);
    return res.status(200).json({ success: true, sections: defaultSections });
  }
}
