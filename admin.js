/* ==========================================================================
   ALEMÃOZINHO VEÍCULOS - JAVASCRIPT DEALER ADMIN LOGIC WITH CLOUD DB
   ========================================================================== */

const CORRECT_PIN = 'alemao2026';
const BACKUP_PIN = '1234';

let vehicles = [];
let editingVehicleId = null;

document.addEventListener('DOMContentLoaded', async () => {
  checkAuth();
});

function checkAuth() {
  const isAuth = sessionStorage.getItem('dealer_auth');
  if (isAuth === 'true') {
    showDashboard();
  } else {
    showLoginScreen();
  }
}

function handleLogin(event) {
  event.preventDefault();
  const inputPin = document.getElementById('dealerPinInput').value;
  const errorMsg = document.getElementById('loginErrorMsg');

  if (inputPin === CORRECT_PIN || inputPin === BACKUP_PIN) {
    sessionStorage.setItem('dealer_auth', 'true');
    errorMsg.style.display = 'none';
    showDashboard();
  } else {
    errorMsg.style.display = 'block';
    errorMsg.innerText = 'Senha incorreta! Tente novamente.';
  }
}

function handleLogout() {
  sessionStorage.removeItem('dealer_auth');
  showLoginScreen();
}

function showLoginScreen() {
  document.getElementById('loginScreenSection').style.display = 'flex';
  document.getElementById('dealerDashboardSection').style.display = 'none';
}

async function showDashboard() {
  document.getElementById('loginScreenSection').style.display = 'none';
  document.getElementById('dealerDashboardSection').style.display = 'block';
  await syncVehiclesFromCloud();
}

async function syncVehiclesFromCloud() {
  const cloudData = await getCloudVehicles();
  if (cloudData && cloudData.length > 0) {
    vehicles = cloudData;
  } else {
    vehicles = [];
  }
  renderAdminTable();
  updateStats();
}

function updateStats() {
  const totalCount = vehicles.length;
  const availableCount = vehicles.filter(v => v.status !== 'sold').length;
  const soldCount = vehicles.filter(v => v.status === 'sold').length;
  const totalValue = vehicles.filter(v => v.status !== 'sold').reduce((sum, v) => sum + (v.price || 0), 0);

  document.getElementById('statTotalCars').innerText = totalCount;
  document.getElementById('statAvailableCars').innerText = availableCount;
  document.getElementById('statSoldCars').innerText = soldCount;
  document.getElementById('statStockValue').innerText = `R$ ${totalValue.toLocaleString('pt-BR')}`;
}

function renderAdminTable() {
  const tbody = document.getElementById('adminTableBody');
  if (!tbody) return;

  if (vehicles.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">
          Nenhum veículo cadastrado no banco de dados. Clique em "Adicionar Novo Veículo" para começar.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = vehicles.map(car => {
    const isSold = car.status === 'sold';
    return `
      <tr style="${isSold ? 'opacity: 0.6;' : ''}">
        <td><img src="${car.img}" alt="${car.make} ${car.model}" class="thumb-small"></td>
        <td>
          <strong>${car.make} ${car.model}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted);">${car.badge || 'Seminovo'}</div>
        </td>
        <td>${car.year}</td>
        <td>${car.km}</td>
        <td><strong style="color:var(--accent-green)">R$ ${car.price.toLocaleString('pt-BR')}</strong></td>
        <td>
          <button onclick="toggleSoldStatus(${car.id})" class="badge ${isSold ? 'badge-sold' : 'badge-dark'}" style="cursor:pointer; border:none;">
            ${isSold ? '🔴 VENDIDO' : '🟢 DISPONÍVEL'}
          </button>
        </td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button onclick="openEditModal(${car.id})" class="btn-icon edit" title="Editar"><i class="fas fa-edit"></i></button>
            <button onclick="deleteVehicle(${car.id})" class="btn-icon delete" title="Excluir"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function toggleSoldStatus(id) {
  const car = vehicles.find(v => v.id === id);
  if (car) {
    car.status = car.status === 'sold' ? 'available' : 'sold';
    renderAdminTable();
    updateStats();
    await saveCloudVehicles(vehicles);
  }
}

async function deleteVehicle(id) {
  if (confirm('Tem certeza que deseja excluir este veículo do estoque? Esta ação não pode ser desfeita.')) {
    vehicles = vehicles.filter(v => v.id !== id);
    renderAdminTable();
    updateStats();
    await saveCloudVehicles(vehicles);
  }
}

function openAddModal() {
  editingVehicleId = null;
  document.getElementById('modalFormTitle').innerText = 'Adicionar Novo Veículo ao Estoque';
  document.getElementById('vehicleForm').reset();
  
  const modal = document.getElementById('vehicleFormModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function openEditModal(id) {
  const car = vehicles.find(v => v.id === id);
  if (!car) return;

  editingVehicleId = id;
  document.getElementById('modalFormTitle').innerText = 'Editar Dados do Veículo';

  document.getElementById('formMake').value = car.make;
  document.getElementById('formModel').value = car.model;
  document.getElementById('formYear').value = car.year;
  document.getElementById('formPrice').value = car.price;
  document.getElementById('formKm').value = car.km;
  document.getElementById('formTrans').value = car.transmission;
  document.getElementById('formFuel').value = car.fuel;
  document.getElementById('formBody').value = car.bodyType;
  document.getElementById('formColor').value = car.color || '';
  document.getElementById('formBadge').value = car.badge || 'Destaque';
  document.getElementById('formImg').value = car.img;
  document.getElementById('formOptionals').value = (car.optionals || []).join(', ');

  const modal = document.getElementById('vehicleFormModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeVehicleModal() {
  const modal = document.getElementById('vehicleFormModal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

async function handleVehicleSubmit(event) {
  event.preventDefault();

  const make = document.getElementById('formMake').value;
  const model = document.getElementById('formModel').value;
  const year = document.getElementById('formYear').value;
  const price = parseFloat(document.getElementById('formPrice').value);
  const km = document.getElementById('formKm').value;
  const transmission = document.getElementById('formTrans').value;
  const fuel = document.getElementById('formFuel').value;
  const bodyType = document.getElementById('formBody').value;
  const color = document.getElementById('formColor').value;
  const badge = document.getElementById('formBadge').value;
  const img = document.getElementById('formImg').value || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
  const optionalsRaw = document.getElementById('formOptionals').value;
  const optionals = optionalsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);

  const kmNum = parseInt(km.replace(/\D/g, '')) || 0;
  const yearNum = parseInt(year.split('/')[0]) || 2022;

  if (editingVehicleId) {
    const carIndex = vehicles.findIndex(v => v.id === editingVehicleId);
    if (carIndex !== -1) {
      vehicles[carIndex] = {
        ...vehicles[carIndex],
        make, model, year, yearNum, price, km, kmNum,
        transmission, fuel, bodyType, color, badge, img, optionals
      };
    }
  } else {
    const newId = vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id)) + 1 : 1;
    vehicles.unshift({
      id: newId,
      make, model, year, yearNum, price, km, kmNum,
      transmission, fuel, bodyType, color, badge,
      badgeType: badge === 'Destaque' ? 'badge-red' : 'badge-dark',
      status: 'available',
      img, optionals
    });
  }

  renderAdminTable();
  updateStats();
  closeVehicleModal();
  
  await saveCloudVehicles(vehicles);
  alert('Estoque atualizado no Banco de Dados Nuvem com sucesso!');
}
