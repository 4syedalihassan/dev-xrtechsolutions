import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getNavigationMenus(req, res);
      case 'POST':
        return await createNavigationMenu(req, res);
      case 'PUT':
        return await updateNavigationMenu(req, res);
      case 'DELETE':
        return await deleteNavigationMenu(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Navigation API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// GET /api/navigation - Fetch all visible navigation menus
async function getNavigationMenus(req, res) {
  try {
    const { data: menus, error } = await supabase
      .from('navigation_menus')
      .select('*')
      .eq('is_visible', true)
      .is('parent_id', null) // Only top-level menus for now
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching navigation menus:', error);
      // Return default navigation if table doesn't exist
      const defaultMenus = [
        { id: '1', label: 'Home', url: '/', display_order: 1, is_visible: true, target: 'internal' },
        { id: '2', label: 'Products', url: '/products', display_order: 2, is_visible: true, target: 'internal' },
        { id: '3', label: 'Categories', url: '/categories', display_order: 3, is_visible: true, target: 'internal' },
        { id: '4', label: 'VR Experience', url: '/immersiveexp', display_order: 4, is_visible: true, target: 'internal' },
        { id: '5', label: 'About', url: '/about', display_order: 5, is_visible: true, target: 'internal' },
        { id: '6', label: 'Contact', url: '/contact', display_order: 6, is_visible: true, target: 'internal' }
      ];
      return res.status(200).json({ success: true, menus: defaultMenus });
    }

    return res.status(200).json({ success: true, menus: menus || [] });
  } catch (error) {
    console.error('Get navigation menus error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/navigation - Create new navigation menu (admin only)
async function createNavigationMenu(req, res) {
  try {
    const { label, url, target, parent_id, display_order, icon, description } = req.body;

    // TODO: Add admin authentication check
    // For now, simple validation
    if (!label || !url) {
      return res.status(400).json({ error: 'Label and URL are required' });
    }

    const { data, error } = await supabase
      .from('navigation_menus')
      .insert([
        {
          label,
          url,
          target: target || 'internal',
          parent_id: parent_id || null,
          display_order: display_order || 0,
          icon: icon || null,
          description: description || null,
          is_visible: true
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating navigation menu:', error);
      return res.status(500).json({ error: 'Failed to create navigation menu' });
    }

    return res.status(201).json({ success: true, menu: data });
  } catch (error) {
    console.error('Create navigation menu error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/navigation?id={id} - Update navigation menu (admin only)
async function updateNavigationMenu(req, res) {
  try {
    const { id } = req.query;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Menu ID is required' });
    }

    // TODO: Add admin authentication check

    const { data, error } = await supabase
      .from('navigation_menus')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating navigation menu:', error);
      return res.status(500).json({ error: 'Failed to update navigation menu' });
    }

    return res.status(200).json({ success: true, menu: data });
  } catch (error) {
    console.error('Update navigation menu error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/navigation?id={id} - Delete navigation menu (admin only)
async function deleteNavigationMenu(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Menu ID is required' });
    }

    // TODO: Add admin authentication check

    const { error } = await supabase
      .from('navigation_menus')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting navigation menu:', error);
      return res.status(500).json({ error: 'Failed to delete navigation menu' });
    }

    return res.status(200).json({ success: true, message: 'Navigation menu deleted' });
  } catch (error) {
    console.error('Delete navigation menu error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
