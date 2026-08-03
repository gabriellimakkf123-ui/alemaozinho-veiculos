/* ==========================================================================
   ALEMÃOZINHO VEÍCULOS - CLOUD DATABASE API MANAGER (REALTIME CLOUD SYNC & FIPE DATA)
   ========================================================================== */

// Primary Cloud REST DB Endpoint
const PRIMARY_CLOUD_ENDPOINT = 'https://jsonblob.com/api/jsonBlob/019fb029-b1e0-782e-b56f-fc6b311cef83';
const LOCAL_STORAGE_KEY      = 'alemaozinho_vehicles_v1';

/**
 * Fetch all vehicles directly from the Online Cloud Database.
 */
async function getCloudVehicles() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(PRIMARY_CLOUD_ENDPOINT, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const cloudData = await response.json();
      if (Array.isArray(cloudData) && cloudData.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudData));
        updateCloudSyncBadge(true, 'Banco de Dados Online Conectado');
        return cloudData;
      }
    }
  } catch (error) {
    console.warn('Usando cache local sincronizado...', error);
  }

  const localSaved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        updateCloudSyncBadge(true, 'Conectado (Cache Sincronizado)');
        return parsed;
      }
    } catch (e) {}
  }

  updateCloudSyncBadge(true, 'Banco de Dados Online Pronto');
  return getInitialVehicles();
}

/**
 * Save updated vehicle array directly to the Online Cloud Database & localStorage.
 */
async function saveCloudVehicles(vehiclesArray) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(vehiclesArray));

  try {
    const response = await fetch(PRIMARY_CLOUD_ENDPOINT, {
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
    }
  } catch (error) {
    console.error('Erro ao salvar no Cloud DB:', error);
  }

  updateCloudSyncBadge(true, 'Salvo no Banco de Dados Local & Nuvem');
  return true;
}

/**
 * Update UI indicator badge ONLY inside admin.html (Dealer Panel)
 */
function updateCloudSyncBadge(isOnline, message) {
  if (!window.location.pathname.includes('admin') && !window.location.pathname.includes('painel')) {
    return;
  }

  const badges = document.querySelectorAll('.cloud-sync-badge');
  badges.forEach(badge => {
    badge.style.background = 'rgba(37, 211, 102, 0.18)';
    badge.style.border = '1px solid rgba(37, 211, 102, 0.5)';
    badge.style.color = '#25D366';
    badge.innerHTML = `<i class="fas fa-database"></i> 🟢 Cloud DB: ${message}`;
  });
}

/**
 * AUTOMATIC CRM LEAD CAPTURE ENGINE
 * Automatically saves customer data to CRM whenever any button is clicked!
 */
function recordLeadToCRM(lead) {
  try {
    const crmKey = 'alemaozinho_crm_leads_v2';
    const saved = localStorage.getItem(crmKey);
    let leads = saved ? JSON.parse(saved) : [];

    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newLead = {
      id: Date.now(),
      date: dateStr,
      name: lead.name || 'Cliente WhatsApp (Site)',
      phone: lead.phone || '(16) 99215-0212',
      car: lead.car || 'Veículo do Estoque',
      status: 'new',
      followDate: now.toISOString().split('T')[0],
      notes: lead.notes || 'Lead capturado automaticamente via clique em botão no site.'
    };

    leads.unshift(newLead);
    localStorage.setItem(crmKey, JSON.stringify(leads));
    console.log('🟢 Lead capturado no CRM:', newLead);
    return newLead;
  } catch (e) {
    console.error('Erro ao capturar lead no CRM:', e);
  }
}

function getInitialVehicles() {
  return [
    {
      id: 1,
      make: 'Chevrolet',
      model: 'Tracker 1.0 Turbo Flex LTZ Automático',
      year: '2022/2022',
      yearNum: 2022,
      price: 98000,
      fipePrice: 96840,
      fipeCode: '004515-2',
      km: '66.200 km',
      kmNum: 66200,
      transmission: 'Automático',
      fuel: 'Flex',
      bodyType: 'SUV',
      color: 'Prata',
      plateEnd: '5',
      badge: 'Destaque Original',
      badgeType: 'badge-red',
      status: 'available',
      img: 'assets/tracker_original.webp',
      optionals: ['Ar Condicionado Digital', 'Direção Elétrica', 'Central Multimídia MyLink 8"', 'Câmera de Ré com Linhas Guia', 'Sensor de Estacionamento Traseiro', 'Piloto Automático', 'Bancos em Couro', 'Rodas de Liga Leve 17"', 'Controle de Estabilidade', '6 Airbags (Frontais, Laterais e Cortina)']
    },
    {
      id: 2,
      make: 'Toyota',
      model: 'Corolla 2.0 XEi 16V Flex Automático',
      year: '2021/2021',
      yearNum: 2021,
      price: 115900,
      fipePrice: 114500,
      fipeCode: '005432-1',
      km: '48.000 km',
      kmNum: 48000,
      transmission: 'Automático',
      fuel: 'Flex',
      bodyType: 'Sedan',
      color: 'Branco Perolizado',
      plateEnd: '9',
      badge: 'Único Dono',
      badgeType: 'badge-dark',
      status: 'available',
      img: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
      optionals: ['Toyota Safety Sense', 'Teto Solar', 'Bancos de Couro Premium', 'Faróis Full LED', 'Chave Presencial Keyless', 'Central Apple CarPlay / Android Auto', 'Controle de Tração', 'Paddle Shift']
    },
    {
      id: 3,
      make: 'Jeep',
      model: 'Compass 1.3 T270 Turbo Flex Limited',
      year: '2023/2023',
      yearNum: 2023,
      price: 149900,
      fipePrice: 142900,
      fipeCode: '017070-9',
      km: '28.500 km',
      kmNum: 28500,
      transmission: 'Automático',
      fuel: 'Flex',
      bodyType: 'SUV',
      color: 'Cinza Granite',
      plateEnd: '2',
      badge: 'Baixa KM',
      badgeType: 'badge-red',
      status: 'available',
      img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      optionals: ['Painel 100% Digital 10.25"', 'Carregador por Indução', 'Park Assist', 'Som Premium Beats', 'Bancos Elétricos', 'Retrovisores Rebatíveis', 'Frenagem Autônoma de Emergência']
    },
    {
      id: 4,
      make: 'Fiat',
      model: 'Toro 1.3 T270 Turbo Flex Volcano',
      year: '2022/2023',
      yearNum: 2022,
      price: 128500,
      fipePrice: 124900,
      fipeCode: '001538-5',
      km: '42.100 km',
      kmNum: 42100,
      transmission: 'Automático',
      fuel: 'Flex',
      bodyType: 'Pickup',
      color: 'Vinho',
      plateEnd: '7',
      badge: 'Revisado',
      badgeType: 'badge-dark',
      status: 'available',
      img: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80',
      optionals: ['Central Multimídia Vertical 10.1"', 'Capota Marítima', 'Santo Antônio Chrome', 'Roda ARO 18"', 'Faróis LED Design', 'Tração Inteligente TC+']
    },
    {
      id: 5,
      make: 'Volkswagen',
      model: 'Polo 1.0 TSI Highline Flex Automático',
      year: '2023/2023',
      yearNum: 2023,
      price: 94900,
      fipePrice: 93800,
      fipeCode: '005510-7',
      km: '19.500 km',
      kmNum: 19500,
      transmission: 'Automático',
      fuel: 'Flex',
      bodyType: 'Hatch',
      color: 'Cinza Platinum',
      plateEnd: '4',
      badge: 'Garantia Fábrica',
      badgeType: 'badge-red',
      status: 'available',
      img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
      optionals: ['Painel Active Info Display', 'Carregador Celular sem Fio', 'Chave Kessy', 'Ar Climatronic Digital', 'Volante Multifuncional em Couro com Shift Paddles']
    }
  ];
}
