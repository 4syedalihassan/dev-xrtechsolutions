/**
 * Admin Settings Helper Functions
 * 
 * Helper functions for AdminSettingsClient to reduce complexity
 */

import { STATUS_COLORS } from './adminConstants';

/**
 * Get default signage data structure
 */
function getDefaultSignageData() {
  return {
    healthcare_center: {
      text: '',
      status: 'OPEN',
      color: STATUS_COLORS.OPEN,
      logo_url: null
    },
    perfume_shop: {
      text: '',
      status: 'OPEN',
      color: STATUS_COLORS.OPEN,
      logo_url: null
    }
  };
}

/**
 * Check if HTTP response status is ok
 */
function isResponseOk(response) {
  return response.ok;
}

/**
 * Check if response data has signboard config
 */
function hasSignboardConfig(responseData) {
  return responseData && responseData.success && responseData.signboard_config;
}

/**
 * Process signage response and update signage data
 */
function processSignageResponse(response, responseData, buildingName) {
  // Early return if response status is not ok
  if (!isResponseOk(response)) {
    return null;
  }

  // Early return if no valid signboard config
  if (!hasSignboardConfig(responseData)) {
    return null;
  }

  const config = responseData.signboard_config;
  console.log(`[Admin Settings] ${buildingName} signage reloaded:`, config.name || '');
  
  return {
    text: config.name || '',
    logo_url: config.logo_url || null
  };
}

/**
 * Save signage settings to building signboard APIs
 */
export async function saveSignageSettings(signage, authHeaders) {
  if (!signage) return { success: true };

  const signageUpdates = [];

  // Healthcare Center signage
  if (signage.healthcare_center) {
    signageUpdates.push(
      fetch('/api/buildings/central-healthcare-complex/signboard', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          name: signage.healthcare_center.text,
          logo_url: signage.healthcare_center.logo_url
        })
      })
    );
  }

  // Perfume Shop signage
  if (signage.perfume_shop) {
    signageUpdates.push(
      fetch('/api/buildings/luxury-perfume-boutique/signboard', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          name: signage.perfume_shop.text,
          logo_url: signage.perfume_shop.logo_url
        })
      })
    );
  }

  // Wait for all signage updates
  if (signageUpdates.length > 0) {
    console.log('[Admin Settings] Saving signage to buildings...');
    const signageResults = await Promise.all(signageUpdates);

    for (let index = 0; index < signageResults.length; index++) {
      const signageResult = signageResults[index];
      if (!signageResult.ok) {
        const errorData = await signageResult.json();
        console.error(`[Admin Settings] Signage update ${index} failed:`, errorData);
        console.error(`[Admin Settings] Status: ${signageResult.status}`);
        return {
          success: false,
          error: `Failed to save signage: ${errorData.error || errorData.message || 'Unknown error'}`
        };
      } else {
        const successData = await signageResult.json();
        console.log(`[Admin Settings] Signage update ${index} succeeded:`, successData);
      }
    }

    console.log('[Admin Settings] All signage updates successful');
  }

  return { success: true };
}

/**
 * Process individual building signage response
 * Note: Mutates signageData object in place
 * @param {Response} response - Fetch API response object
 * @param {string} buildingName - Name of the building for logging
 * @param {string} signageKey - Key in signageData object to update
 * @param {Object} signageData - Signage data object to mutate
 */
async function processBuilding(response, buildingName, signageKey, signageData) {
  if (!response.ok) {
    return;
  }

  const data = await response.json();
  const updated = processSignageResponse(response, data, buildingName);
  
  if (updated) {
    // Mutate signageData in place
    signageData[signageKey] = {
      ...signageData[signageKey],
      ...updated
    };
  }
}

/**
 * Reload signage data from building APIs
 */
export async function loadSignageFromAPIs() {
  try {
    const [healthcareResponse, perfumeResponse] = await Promise.all([
      fetch('/api/buildings/central-healthcare-complex/signboard'),
      fetch('/api/buildings/luxury-perfume-boutique/signboard')
    ]);

    const signageData = getDefaultSignageData();

    // Process both buildings
    await processBuilding(
      healthcareResponse,
      'Central Healthcare Complex',
      'healthcare_center',
      signageData
    );

    await processBuilding(
      perfumeResponse,
      'Luxury Perfume Boutique',
      'perfume_shop',
      signageData
    );

    return signageData;
  } catch (error) {
    console.error('[Admin Settings] Error loading signage from APIs:', error);
    return getDefaultSignageData();
  }
}
