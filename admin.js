/* ==========================================================================
   ALEMÃOZINHO VEÍCULOS - JAVASCRIPT DEALER ADMIN LOGIC WITH FILE UPLOAD (PNG, JPG, PDF)
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
    const isPdf = car.img && car.img.startsWith('data:application/pdf');
    const displayImg = isPdf ? 'assets/logo.png' : car.img;

    return `
      <tr style="${isSold ? 'opacity: 0.6;' : ''}">
        <td>
          <img src="${displayImg}" alt="${car.make} ${car.model}" class="thumb-small">
          ${isPdf ? '<div style="font-size:0.65rem; color:var(--primary); font-weight:700;">PDF</div>' : ''}
        </td>
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
  
  document.getElementById('formImg').value = '';
  document.getElementById('fileUploadPreview').style.display = 'none';
  document.getElementById('filePreviewImg').style.display = 'none';
  document.getElementById('filePdfBadge').style.display = 'none';

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

  const previewBox = document.getElementById('fileUploadPreview');
  const previewImg = document.getElementById('filePreviewImg');
  const pdfBadge = document.getElementById('filePdfBadge');

  if (car.img) {
    previewBox.style.display = 'block';
    if (car.img.startsWith('data:application/pdf')) {
      previewImg.style.display = 'none';
      pdfBadge.style.display = 'block';
    } else {
      pdfBadge.style.display = 'none';
      previewImg.style.display = 'block';
      previewImg.src = car.img;
    }
  } else {
    previewBox.style.display = 'none';
  }

  const modal = document.getElementById('vehicleFormModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeVehicleModal() {
  const modal = document.getElementById('vehicleFormModal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

/* HANDLE PNG, JPG, WEBP AND PDF FILE UPLOADS */
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const previewBox = document.getElementById('fileUploadPreview');
  const previewImg = document.getElementById('filePreviewImg');
  const pdfBadge = document.getElementById('filePdfBadge');

  previewBox.style.display = 'block';

  if (file.type === 'application/pdf') {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('formImg').value = e.target.result;
      previewImg.style.display = 'none';
      pdfBadge.style.display = 'block';
      pdfBadge.innerHTML = `<i class="fas fa-file-pdf" style="color:var(--primary)"></i> Arquivo PDF Selecionado: <strong>${file.name}</strong>`;
    };
    reader.readAsDataURL(file);
  } else {
    // PNG, JPG, WEBP image file compression
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        document.getElementById('formImg').value = compressedDataUrl;
        
        pdfBadge.style.display = 'none';
        previewImg.style.display = 'block';
        previewImg.src = compressedDataUrl;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
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
  let img = document.getElementById('formImg').value;

  if (!img) {
    alert('Por favor, selecione uma foto (PNG/JPG) ou documento PDF para o veículo!');
    return;
  }

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
  alert('Veículo e foto/arquivo salvos no Banco de Dados Nuvem com sucesso!');
}
