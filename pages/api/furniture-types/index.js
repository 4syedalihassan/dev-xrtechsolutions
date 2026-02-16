// Furniture Types API - Get available furniture types and categories
// GET /api/furniture-types - List all furniture types
// GET /api/furniture-types?category=seating - Filter by category
// Sprint 3 - User Story 3.2

import {
  getAllFurnitureTypes,
  getFurnitureTypesByCategory,
  getFurnitureTypeById,
  getCategoriesWithCounts,
  FURNITURE_CATEGORIES
} from '../../../lib/furnitureTypes.js';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Furniture Types API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - List furniture types
async function handleGet(req, res) {
  const { category, id } = req.query;

  // Get specific type by ID
  if (id) {
    const furnitureType = getFurnitureTypeById(id);
    if (!furnitureType) {
      return res.status(404).json({
        success: false,
        error: 'Furniture type not found'
      });
    }
    return res.status(200).json({
      success: true,
      furniture_type: furnitureType
    });
  }

  // Filter by category
  if (category) {
    // Validate category
    if (!Object.values(FURNITURE_CATEGORIES).includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        valid_categories: Object.values(FURNITURE_CATEGORIES)
      });
    }

    const types = getFurnitureTypesByCategory(category);
    return res.status(200).json({
      success: true,
      category,
      furniture_types: types,
      count: types.length
    });
  }

  // Get all types with categories
  const allTypes = getAllFurnitureTypes();
  const categoryCounts = getCategoriesWithCounts();

  return res.status(200).json({
    success: true,
    furniture_types: allTypes,
    count: allTypes.length,
    categories: Object.values(FURNITURE_CATEGORIES),
    category_counts: categoryCounts
  });
}
