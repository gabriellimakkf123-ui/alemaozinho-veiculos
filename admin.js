/* ==========================================================================
   ALEMÃOZINHO VEÍCULOS - DEALER INVENTORY & CONTRACT MANAGEMENT (ADMIN.JS)
   ========================================================================== */

const DEALER_PIN = 'alemao2026';
let vehicles = [];
let editingVehicleId = null;
let selectedContractCar = null;

// Initialize Admin Panel Session
document.addEventListener('DOMContentLoaded', async () => {
  const isAuth = sessionStorage.getItem('dealer_auth') === 'true';
  if (isAuth) {
    document.getElementById('loginScreenSection').style.display = 'none';
    document.getElementById('dealerDashboardSection').style.display = 'block';
    await syncVehiclesFromCloud();
  }
});

function handleLogin(event) {
  event.preventDefault();
  const pinInput = document.getElementById('dealerPinInput').value;
  const errorMsg = document.getElementById('loginErrorMsg');

  if (pinInput === DEALER_PIN || pinInput === 'alemao-master-2026') {
    sessionStorage.setItem('dealer_auth', 'true');
    showDashboard();
  } else {
    errorMsg.innerText = 'Senha incorreta. Tente novamente.';
    errorMsg.style.display = 'block';
  }
}

function handleLogout() {
  sessionStorage.removeItem('dealer_auth');
  window.location.reload();
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

  // Profit Margin Calculation
  const totalProfit = vehicles.reduce((sum, v) => {
    const buyP = v.buyPrice || Math.round((v.price || 0) * 0.84);
    const prepC = v.prepCost || 1500;
    return sum + ((v.price || 0) - (buyP + prepC));
  }, 0);

  document.getElementById('statTotalCars').innerText = totalCount;
  document.getElementById('statAvailableCars').innerText = availableCount;
  if (document.getElementById('statSoldCars')) {
    document.getElementById('statSoldCars').innerText = soldCount;
  }
  document.getElementById('statStockValue').innerText = `R$ ${totalValue.toLocaleString('pt-BR')}`;
  
  const profitStatEl = document.getElementById('statTotalProfit');
  if (profitStatEl) {
    profitStatEl.innerText = `R$ ${totalProfit.toLocaleString('pt-BR')}`;
  }
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

    // Real Profit Margin
    const buyP = car.buyPrice || Math.round(car.price * 0.84);
    const prepC = car.prepCost || 1500;
    const netProfit = car.price - (buyP + prepC);
    const marginPct = car.price > 0 ? ((netProfit / car.price) * 100).toFixed(1) : '0';
    const fipeVal = car.fipePrice ? car.fipePrice : Math.round(car.price * 0.98);

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
        <td style="font-size:0.85rem;">
          ${car.year}<br>
          <span style="color:var(--text-muted);">${car.km}</span>
        </td>
        <td><strong style="color:var(--accent-green)">R$ ${car.price.toLocaleString('pt-BR')}</strong></td>
        <td style="font-size:0.8rem;">
          FIPE: R$ ${fipeVal.toLocaleString('pt-BR')}<br>
          <span style="color:var(--accent-gold); font-weight:700;">Lucro: R$ ${netProfit.toLocaleString('pt-BR')} (${marginPct}%)</span>
        </td>
        <td>
          <button onclick="toggleSoldStatus(${car.id})" class="badge ${isSold ? 'badge-sold' : 'badge-dark'}" style="cursor:pointer; border:none;">
            ${isSold ? '🔴 VENDIDO' : '🟢 DISPONÍVEL'}
          </button>
        </td>
        <td>
          <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
            <button onclick="openContractModal(${car.id})" class="btn-icon" style="background:#2563EB; color:#FFF;" title="Gerar Contrato de Venda">
              <i class="fas fa-file-contract"></i>
            </button>
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

/* REALTIME PROFIT MARGIN CALCULATOR */
function calculateMarginPreview() {
  const price = parseFloat(document.getElementById('formPrice').value) || 0;
  const buyPrice = parseFloat(document.getElementById('formBuyPrice').value) || Math.round(price * 0.84);
  const prepCost = parseFloat(document.getElementById('formPrepCost').value) || 0;

  const profit = price - (buyPrice + prepCost);
  const marginPct = price > 0 ? ((profit / price) * 100).toFixed(1) : 0;

  const profitValEl = document.getElementById('previewProfitVal');
  const marginPctEl = document.getElementById('previewMarginPct');

  if (profitValEl) profitValEl.innerText = `R$ ${profit.toLocaleString('pt-BR')}`;
  if (marginPctEl) marginPctEl.innerText = `${marginPct}%`;
}

function openAddModal() {
  editingVehicleId = null;
  document.getElementById('modalFormTitle').innerText = 'Adicionar Novo Veículo ao Estoque';
  document.getElementById('vehicleForm').reset();
  
  document.getElementById('formImg').value = '';
  document.getElementById('fileUploadPreview').style.display = 'none';
  document.getElementById('filePreviewImg').style.display = 'none';
  document.getElementById('filePdfBadge').style.display = 'none';

  calculateMarginPreview();

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
  
  if (document.getElementById('formBuyPrice')) {
    document.getElementById('formBuyPrice').value = car.buyPrice || Math.round(car.price * 0.84);
  }
  if (document.getElementById('formPrepCost')) {
    document.getElementById('formPrepCost').value = car.prepCost || 1500;
  }

  const fipePriceInput = document.getElementById('formFipePrice');
  if (fipePriceInput) fipePriceInput.value = car.fipePrice || Math.round(car.price * 0.98);
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

  calculateMarginPreview();

  const modal = document.getElementById('vehicleFormModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeVehicleModal() {
  const modal = document.getElementById('vehicleFormModal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

/* FILE UPLOAD SUPPORT */
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
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) { height *= maxDim / width; width = maxDim; }
        } else {
          if (height > maxDim) { width *= maxDim / height; height = maxDim; }
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
  const buyPrice = parseFloat(document.getElementById('formBuyPrice').value) || Math.round(price * 0.84);
  const prepCost = parseFloat(document.getElementById('formPrepCost').value) || 1500;
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

  const fipePriceInput = document.getElementById('formFipePrice');
  const fipePrice = fipePriceInput && fipePriceInput.value ? parseFloat(fipePriceInput.value) : Math.round(price * 0.98);

  const optionalsRaw = document.getElementById('formOptionals').value;
  const optionals = optionalsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);

  const kmNum = parseInt(km.replace(/\D/g, '')) || 0;
  const yearNum = parseInt(year.split('/')[0]) || 2022;

  if (editingVehicleId) {
    const carIndex = vehicles.findIndex(v => v.id === editingVehicleId);
    if (carIndex !== -1) {
      vehicles[carIndex] = {
        ...vehicles[carIndex],
        make, model, year, yearNum, price, buyPrice, prepCost, fipePrice, km, kmNum,
        transmission, fuel, bodyType, color, badge, img, optionals
      };
    }
  } else {
    const newCar = {
      id: Date.now(),
      make, model, year, yearNum, price, buyPrice, prepCost, fipePrice, km, kmNum,
      transmission, fuel, bodyType, color, badge,
      badgeType: 'badge-red',
      status: 'available',
      img, optionals
    };
    vehicles.unshift(newCar);
  }

  renderAdminTable();
  updateStats();
  closeVehicleModal();
  await saveCloudVehicles(vehicles);
}

/* VEHICLE PURCHASE & SALE CONTRACT GENERATOR LOGIC */
function openContractModal(id) {
  selectedContractCar = vehicles.find(v => v.id === id);
  if (!selectedContractCar) return;

  const car = selectedContractCar;
  document.getElementById('docCarTitle').innerText = `${car.make} ${car.model}`;
  document.getElementById('docCarYear').innerText = car.year;
  document.getElementById('docCarColor').innerText = car.color || 'Prata';
  document.getElementById('docCarFuel').innerText = car.fuel || 'Flex';
  document.getElementById('docCarKm').innerText = car.km;
  document.getElementById('docCarTrans').innerText = car.transmission;
  document.getElementById('docCarPrice').innerText = `R$ ${car.price.toLocaleString('pt-BR')}`;
  
  const today = new Date();
  document.getElementById('docContractDate').innerText = `${today.getDate()} de ${today.toLocaleString('pt-BR', { month: 'long' })} de ${today.getFullYear()}`;

  updateContractDocument();

  const modal = document.getElementById('contractModalOverlay');
  modal.classList.add('active');
}

function closeContractModal() {
  document.getElementById('contractModalOverlay').classList.remove('active');
}

function updateContractDocument() {
  const name = document.getElementById('contractBuyerName').value || '________________________________________';
  const cpf = document.getElementById('contractBuyerCpf').value || '_______________';
  const address = document.getElementById('contractBuyerAddress').value || '__________________________________________________';

  document.getElementById('docBuyerName').innerText = name;
  document.getElementById('docBuyerCpf').innerText = cpf;
  document.getElementById('docBuyerAddress').innerText = address;
  document.getElementById('docSigBuyerName').innerText = name !== '________________________________________' ? name.toUpperCase() : 'COMPRADOR';
}
