/* ==========================================================================
   ALEMÃOZINHO VEÍCULOS - CLOUD DATABASE API MANAGER (ONLINE REALTIME PERSISTENCE)
   ========================================================================== */

const CLOUD_DB_ENDPOINT = 'https://jsonblob.com/api/jsonBlob/019fb029-b1e0-782e-b56f-fc6b311cef83';
const LOCAL_STORAGE_KEY = 'alemaozinho_vehicles_v1';

/**
 * Fetch all vehicles directly from the Online Cloud Database.
 * Falls back gracefully to localStorage if network is offline.
 */
async function getCloudVehicles() {
  try {
    const response = await fetch(CLOUD_DB_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (response.ok) {
      const cloudData = await response.json();
      if (Array.isArray(cloudData) && cloudData.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudData));
        updateCloudSyncBadge(true, 'Banco de Dados Online Conectado');
        return cloudData;
      }
    }
  } catch (error) {
    console.warn('Conexão Cloud DB indisponível, usando cache local:', error);
  }

  // Fallback to local storage
  updateCloudSyncBadge(false, 'Modo Offline (Cache Local)');
  const localSaved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (localSaved) {
    try {
      return JSON.parse(localSaved);
    } catch (e) {
      return [];
    }
  }
  return [];
}

/**
 * Save updated vehicle array directly to the Online Cloud Database & localStorage.
 */
async function saveCloudVehicles(vehiclesArray) {
  // Always update local storage first for instant UI response
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(vehiclesArray));

  try {
    const response = await fetch(CLOUD_DB_ENDPOINT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(vehiclesArray)
    });

    if (response.ok) {
      updateCloudSyncBadge(true, 'Salvo no Banco de Dados Online');
      return true;
    } else {
      updateCloudSyncBadge(false, 'Erro na sincronização nuvem');
      return false;
    }
  } catch (error) {
    console.error('Erro ao salvar no Cloud DB:', error);
    updateCloudSyncBadge(false, 'Salvo localmente (Sem conexão)');
    return false;
  }
}

/**
 * Update UI indicator badge for Cloud DB Status
 */
function updateCloudSyncBadge(isOnline, message) {
  const badges = document.querySelectorAll('.cloud-sync-badge');
  badges.forEach(badge => {
    if (isOnline) {
      badge.style.background = 'rgba(37, 211, 102, 0.15)';
      badge.style.border = '1px solid rgba(37, 211, 102, 0.4)';
      badge.style.color = '#25D366';
      badge.innerHTML = `<i class="fas fa-database"></i> 🟢 Cloud DB: ${message}`;
    } else {
      badge.style.background = 'rgba(245, 166, 35, 0.15)';
      badge.style.border = '1px solid rgba(245, 166, 35, 0.4)';
      badge.style.color = '#F5A623';
      badge.innerHTML = `<i class="fas fa-wifi-slash"></i> 🟡 ${message}`;
    }
  });
}
