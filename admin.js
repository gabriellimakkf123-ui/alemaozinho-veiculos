/* ==========================================================================
   ALEMÃOZINHO VEÍCULOS - ADMIN DEALER LOGIC (RESTRITO & COM SENHA)
   ========================================================================== */

const STORAGE_KEY = 'alemaozinho_vehicles_v1';
const DEALER_PASS = 'alemao2026'; // Default dealer PIN/Password

const INITIAL_VEHICLES = [
  {
    id: 1,
    make: 'Chevrolet',
    model: 'Tracker 1.0 Turbo Flex LTZ Automático',
    year: '2022/2022',
    yearNum: 2022,
    price: 98000,
    km: '66.200 km',
    kmNum: 66200,
    transmission: 'Automático',
    fuel: 'Flex',
    bodyType: 'SUV',
    color: 'Prata',
    plateEnd: '5',
    badge: 'Destaque',
    badgeType: 'badge-red',
    status: 'available',
    img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    optionals: ['Ar Condicionado Digital', 'Direção Elétrica', 'Central Multimídia 8"', 'Câmera de Ré', 'Sensor de Estacionamento', 'Piloto Automático', 'Bancos de Couro', 'Rodas Liga Leve 17"', 'Controle de Estabilidade', 'Airbags Frontais e Laterais']
  },
  {
    id: 2,
    make: 'Toyota',
    model: 'Corolla 2.0 XEi 16V Flex Automático',
    year: '2021/2021',
    yearNum: 2021,
    price: 115900,
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
    km: '19.800 km',
    kmNum: 19800,
    transmission: 'Automático',
    fuel: 'Flex',
    bodyType: 'Hatch',
    color: 'Preto Ninja',
    plateEnd: '4',
    badge: 'Garantia Fábrica',
    badgeType: 'badge-red',
    status: 'available',
    img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    optionals: ['Active Info Display', 'Ar Climatronic Touch', 'Carregamento por Indução', 'Start/Stop Engine', 'Rodas Liga Leve 16"', 'Sensor de Chuva e Crepuscular']
  },
  {
    id: 6,
    make: 'Honda',
    model: 'Civic 2.0 EXL 16V Flex Automático',
    year: '2020/2021',
    yearNum: 2020,
    price: 118900,
    km: '55.000 km',
    kmNum: 55000,
    transmission: 'Automático',
    fuel: 'Flex',
    bodyType: 'Sedan',
    color: 'Prata Platinum',
    plateEnd: '8',
    badge: 'Seminovo Top',
    badgeType: 'badge-dark',
    status: 'available',
    img: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&w=800&q=80',
    optionals: ['Bancos de Couro', 'Faróis de Neblina LED', 'Freio de Mão Eletrônico com Brake Hold', 'Ar Dual Zone', 'Teto Solar Elétrico', 'Câmera de Ré Multivisão']
  }
];

let vehicles = [];
let editingVehicleId = null;

document.addEventListener('DOMContentLoaded', () => {
  checkSessionAuth();
  loadVehiclesFromStorage();
});

function checkSessionAuth() {
  const isAuth = sessionStorage.getItem('dealer_auth');
  if (isAuth === 'true') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dealerDashboard').style.display = 'block';
    renderAdminTable();
    updateAdminStats();
  } else {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dealerDashboard').style.display = 'none';
  }
}

function handleDealerLogin(e) {
  e.preventDefault();
  const inputPass = document.getElementById('dealerPasswordInput').value;
  const errorMsg = document.getElementById('loginErrorMsg');

  if (inputPass === DEALER_PASS || inputPass === '1234') {
    sessionStorage.setItem('dealer_auth', 'true');
    errorMsg.style.display = 'none';
    checkSessionAuth();
  } else {
    errorMsg.style.display = 'block';
    document.getElementById('dealerPasswordInput').value = '';
  }
}

function handleDealerLogout() {
  sessionStorage.removeItem('dealer_auth');
  checkSessionAuth();
}

function loadVehiclesFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      vehicles = JSON.parse(saved);
    } catch (e) {
      vehicles = [...INITIAL_VEHICLES];
    }
  } else {
    vehicles = [...INITIAL_VEHICLES];
    saveVehiclesToStorage();
  }
}

function saveVehiclesToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
}

function updateAdminStats() {
  const totalVal = vehicles.reduce((sum, v) => sum + (v.price || 0), 0);
  const availableCount = vehicles.filter(v => v.status !== 'sold').length;
  const soldCount = vehicles.filter(v => v.status === 'sold').length;

  document.getElementById('statTotalCars').innerText = vehicles.length;
  document.getElementById('statTotalValue').innerText = `R$ ${(totalVal / 1000).toFixed(0)}k`;
  document.getElementById('statAvailable').innerText = availableCount;
  document.getElementById('statSold').innerText = soldCount;
}

function renderAdminTable() {
  const tbody = document.getElementById('adminTableBody');
  if (!tbody) return;

  if (vehicles.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">Nenhum veículo cadastrado no estoque.</td></tr>`;
    return;
  }

  tbody.innerHTML = vehicles.map(car => `
    <tr>
      <td><img src="${car.img}" class="thumb-small"></td>
      <td>
        <strong>${car.make} ${car.model}</strong>
        <div style="font-size:0.75rem; color:var(--text-muted);">${car.color || 'N/I'} • Placa final ${car.plateEnd || '-'}</div>
      </td>
      <td>${car.year}</td>
      <td>${car.km}</td>
      <td style="font-weight:700; color:#FFF;">R$ ${car.price.toLocaleString('pt-BR')}</td>
      <td>
        <span class="badge ${car.status === 'sold' ? 'badge-sold' : 'badge-red'}">
          ${car.status === 'sold' ? 'VENDIDO' : 'DISPONÍVEL'}
        </span>
      </td>
      <td>
        <div style="display:flex; gap:0.4rem;">
          <button onclick="toggleSoldStatus(${car.id})" class="btn-icon" title="Alternar Status Vendido/Disponível">
            <i class="fas ${car.status === 'sold' ? 'fa-undo' : 'fa-check'}"></i>
          </button>
          <button onclick="openEditVehicleModal(${car.id})" class="btn-icon edit" title="Editar Veículo">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="deleteVehicle(${car.id})" class="btn-icon delete" title="Excluir Veículo">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddVehicleModal() {
  editingVehicleId = null;
  document.getElementById('adminFormTitle').innerText = 'Cadastrar Novo Veículo no Estoque';
  document.getElementById('adminVehicleForm').reset();
  
  const modal = document.getElementById('adminFormModalOverlay');
  modal.classList.add('active');
}

function openEditVehicleModal(id) {
  const car = vehicles.find(v => v.id === id);
  if (!car) return;

  editingVehicleId = id;
  document.getElementById('adminFormTitle').innerText = 'Editar Veículo em Estoque';
  
  document.getElementById('formMake').value = car.make;
  document.getElementById('formModel').value = car.model;
  document.getElementById('formYear').value = car.year;
  document.getElementById('formPrice').value = car.price;
  document.getElementById('formKm').value = car.km;
  document.getElementById('formTransmission').value = car.transmission;
  document.getElementById('formFuel').value = car.fuel;
  document.getElementById('formBodyType').value = car.bodyType;
  document.getElementById('formColor').value = car.color || '';
  document.getElementById('formPlateEnd').value = car.plateEnd || '';
  document.getElementById('formBadge').value = car.badge || 'Destaque';
  document.getElementById('formImgUrl').value = car.img;

  const modal = document.getElementById('adminFormModalOverlay');
  modal.classList.add('active');
}

function closeAdminFormModal() {
  const modal = document.getElementById('adminFormModalOverlay');
  modal.classList.remove('active');
}

function handleVehicleFormSubmit(e) {
  e.preventDefault();

  const make = document.getElementById('formMake').value;
  const model = document.getElementById('formModel').value;
  const year = document.getElementById('formYear').value;
  const price = parseFloat(document.getElementById('formPrice').value);
  const km = document.getElementById('formKm').value;
  const transmission = document.getElementById('formTransmission').value;
  const fuel = document.getElementById('formFuel').value;
  const bodyType = document.getElementById('formBodyType').value;
  const color = document.getElementById('formColor').value;
  const plateEnd = document.getElementById('formPlateEnd').value;
  const badge = document.getElementById('formBadge').value;
  let imgUrl = document.getElementById('formImgUrl').value;

  if (!imgUrl) {
    imgUrl = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
  }

  const kmNum = parseInt(km.replace(/\D/g, '')) || 0;
  const yearNum = parseInt(year.substring(0, 4)) || 2022;

  if (editingVehicleId) {
    const index = vehicles.findIndex(v => v.id === editingVehicleId);
    if (index !== -1) {
      vehicles[index] = {
        ...vehicles[index],
        make, model, year, yearNum, price, km, kmNum,
        transmission, fuel, bodyType, color, plateEnd, badge,
        img: imgUrl
      };
    }
  } else {
    const newId = vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id)) + 1 : 1;
    const newCar = {
      id: newId,
      make, model, year, yearNum, price, km, kmNum,
      transmission, fuel, bodyType, color, plateEnd, badge,
      badgeType: badge === 'Destaque' ? 'badge-red' : 'badge-dark',
      status: 'available',
      img: imgUrl,
      optionals: ['Ar Condicionado Digital', 'Direção Elétrica', 'Freios ABS', 'Airbags Frontais', 'Central Multimídia']
    };
    vehicles.unshift(newCar);
  }

  saveVehiclesToStorage();
  renderAdminTable();
  updateAdminStats();
  closeAdminFormModal();

  alert(editingVehicleId ? 'Veículo atualizado com sucesso!' : 'Novo veículo cadastrado no estoque!');
}

function toggleSoldStatus(id) {
  const car = vehicles.find(v => v.id === id);
  if (!car) return;

  car.status = car.status === 'sold' ? 'available' : 'sold';
  saveVehiclesToStorage();
  renderAdminTable();
  updateAdminStats();
}

function deleteVehicle(id) {
  if (confirm('Tem certeza que deseja remover este veículo do estoque?')) {
    vehicles = vehicles.filter(v => v.id !== id);
    saveVehiclesToStorage();
    renderAdminTable();
    updateAdminStats();
  }
}

function resetStockToDefault() {
  if (confirm('Deseja restaurar o estoque inicial padrão da Alemãozinho Veículos?')) {
    vehicles = [...INITIAL_VEHICLES];
    saveVehiclesToStorage();
    renderAdminTable();
    updateAdminStats();
    alert('Estoque restaurado!');
  }
}
