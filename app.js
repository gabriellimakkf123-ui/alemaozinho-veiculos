/* ==========================================================================
   ALEMÃOZINHO VEÍCULOS - WEBMOTORS STYLE PUBLIC SHOWROOM LOGIC & MODAL
   ========================================================================== */

const STORE_WHATSAPP = '5516992150212';

let vehicles = [];
let currentFilterCategory = 'all';
let currentSearchQuery = '';
let currentMakeFilter = 'all';
let currentTransFilter = 'all';
let currentPriceFilter = 'all';
let currentSort = 'default';

document.addEventListener('DOMContentLoaded', async () => {
  await syncVehiclesFromCloud();
  setupEventListeners();
  updateFinancingCalculation();

  setInterval(async () => {
    await syncVehiclesFromCloud(true);
  }, 15000);

  window.addEventListener('storage', (e) => {
    if (e.key === LOCAL_STORAGE_KEY) {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          vehicles = JSON.parse(saved);
          renderInventory();
        } catch (err) {}
      }
    }
  });
});

async function syncVehiclesFromCloud(isBackground = false) {
  const cloudData = await getCloudVehicles();
  if (cloudData && cloudData.length > 0) {
    vehicles = cloudData;
    renderInventory();
  }
}

function renderInventory() {
  const container = document.getElementById('carsContainer');
  if (!container) return;

  const isHomePage = document.body.id === 'homePage';

  let filtered = vehicles.filter(car => {
    if (car.status === 'sold') return false;

    if (currentFilterCategory === 'destaque' && car.badge !== 'Destaque' && !car.badge.includes('Destaque')) return false;
    if (currentFilterCategory !== 'all' && currentFilterCategory !== 'destaque') {
      if (car.bodyType.toLowerCase() !== currentFilterCategory.toLowerCase()) return false;
    }

    if (currentMakeFilter !== 'all' && car.make.toLowerCase() !== currentMakeFilter.toLowerCase()) return false;
    if (currentTransFilter !== 'all' && car.transmission.toLowerCase() !== currentTransFilter.toLowerCase()) return false;

    if (currentPriceFilter === 'at90' && car.price > 90000) return false;
    if (currentPriceFilter === '90a120' && (car.price < 90000 || car.price > 120000)) return false;
    if (currentPriceFilter === 'acima120' && car.price < 120000) return false;

    if (currentSearchQuery.trim() !== '') {
      const q = currentSearchQuery.toLowerCase();
      const match = car.make.toLowerCase().includes(q) || 
                    car.model.toLowerCase().includes(q) || 
                    car.bodyType.toLowerCase().includes(q) ||
                    car.year.includes(q);
      if (!match) return false;
    }

    return true;
  });

  const countBadge = document.getElementById('resultsCountBadge');
  if (countBadge) {
    countBadge.innerText = `${filtered.length} ${filtered.length === 1 ? 'veículo encontrado' : 'veículos encontrados'}`;
  }

  if (currentSort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'km-asc') {
    filtered.sort((a, b) => a.kmNum - b.kmNum);
  } else if (currentSort === 'year-desc') {
    filtered.sort((a, b) => b.yearNum - a.yearNum);
  }

  if (isHomePage) {
    filtered = filtered.slice(0, 4);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
        <i class="fas fa-car-side" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></i>
        <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Nenhum veículo encontrado</h3>
        <p style="color: var(--text-muted);">Tente alterar os filtros de busca para encontrar outras opções disponíveis.</p>
        <button onclick="resetFilters()" class="btn-primary" style="margin-top: 1.5rem;">Limpar Filtros</button>
      </div>
    `;
    return;
  }

   function openCarModal(id) {
  window.location.href = `detalhes.html?id=${id}`;
}

  container.innerHTML = filtered.map(car => {
    const parcelEst = Math.round((car.price * 0.7) / 48 * 1.18);
    const waText = encodeURIComponent(`Olá! Vi o veículo ${car.make} ${car.model} (${car.year}) por R$ ${car.price.toLocaleString('pt-BR')} no modelo Webmotors do site e gostaria de mais informações!`);
    const waUrl = `https://wa.me/${STORE_WHATSAPP}?text=${waText}`;

    return `
      <div class="car-card">
        <div class="car-img-wrapper">
          <div class="car-badges">
            <span class="badge ${car.badgeType}">${car.badge || 'Seminovo'}</span>
            <span class="badge badge-dark"><i class="fas fa-shield-alt"></i> Laudo Aprovado</span>
          </div>
          <img src="${car.img}" alt="${car.make} ${car.model}" loading="lazy">
        </div>
        <div class="car-body">
          <div class="car-year">${car.year} • ${car.bodyType} • 📍 Pedregulho - SP</div>
          <h3 class="car-title">${car.make} ${car.model}</h3>
          
          <div class="car-specs">
            <div class="spec-item">
              <i class="fas fa-tachometer-alt"></i>
              <span>${car.km}</span>
            </div>
            <div class="spec-item">
              <i class="fas fa-cog"></i>
              <span>${car.transmission}</span>
            </div>
            <div class="spec-item">
              <i class="fas fa-gas-pump"></i>
              <span>${car.fuel}</span>
            </div>
          </div>

          <div class="car-price-row">
            <div>
              <div class="price-parcel">Parc. estimadas a partir de</div>
              <div style="color: var(--accent-green); font-weight: 700; font-size: 0.95rem;">R$ ${parcelEst.toLocaleString('pt-BR')}/mês</div>
            </div>
            <div class="price-main">R$ ${car.price.toLocaleString('pt-BR')}</div>
          </div>

          <div class="car-actions" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: auto;">
            <div style="display: flex; gap: 0.5rem;">
              <button onclick="openCarModal(${car.id})" class="btn-outline" style="flex:1; justify-content:center; padding: 0.6rem; font-size:0.85rem;">
                <i class="fas fa-eye"></i> Detalhes
              </button>
              <button onclick="openFinancingForm(${car.id})" class="btn-primary" style="flex:1.2; justify-content:center; padding: 0.6rem; font-size: 0.82rem; background: linear-gradient(135deg, #10B981, #059669); border-color: #10B981;">
                <i class="fas fa-calculator"></i> Simular
              </button>
            </div>
            <a href="${waUrl}" target="_blank" onclick="handleWhatsAppInterestClick(${car.id})" class="btn-whatsapp" style="justify-content:center; padding: 0.6rem; font-size: 0.85rem;">
              <i class="fab fa-whatsapp"></i> Tenho Interesse
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openFinancingForm(carId) {
  sessionStorage.setItem('selectedCarForFinancingId', carId);
  window.location.href = `https://gabriellimakkf123-ui.github.io/alemaozinho-veiculos/proposta.html?carId=${carId}`;
}

function resetFilters() {
  currentFilterCategory = 'all';
  currentSearchQuery = '';
  currentMakeFilter = 'all';
  currentTransFilter = 'all';
  currentPriceFilter = 'all';
  currentSort = 'default';

  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.tab-btn[data-category="all"]')?.classList.add('active');

  const heroSearchInput = document.getElementById('heroSearchInput');
  const heroMakeSelect = document.getElementById('heroMakeSelect');
  const heroTransSelect = document.getElementById('heroTransSelect');
  const heroPriceSelect = document.getElementById('heroPriceSelect');

  if (heroSearchInput) heroSearchInput.value = '';
  if (heroMakeSelect) heroMakeSelect.value = 'all';
  if (heroTransSelect) heroTransSelect.value = 'all';
  if (heroPriceSelect) heroPriceSelect.value = 'all';

  renderInventory();
}

function openCarModal(id) {
  window.location.href = `detalhes.html?id=${id}`;
}

function closeModal() {
  const modalOverlay = document.getElementById('carModalOverlay');
  if (modalOverlay) modalOverlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function updateFinancingCalculation() {
  const priceInput = document.getElementById('simPriceRange');
  const downInput = document.getElementById('simDownRange');
  const activeTermBtn = document.querySelector('.term-btn.active');

  if (!priceInput || !downInput) return;

  const vehiclePrice = parseFloat(priceInput.value);
  const maxDown = vehiclePrice * 0.8;
  downInput.max = maxDown;

  let downPayment = parseFloat(downInput.value);
  if (downPayment > maxDown) {
    downPayment = maxDown;
    downInput.value = downPayment;
  }

  const termMonths = parseInt(activeTermBtn ? activeTermBtn.dataset.term : '48');
  const financedAmount = Math.max(0, vehiclePrice - downPayment);

  const monthlyRate = 0.0145;
  let monthlyParcel = 0;

  if (financedAmount > 0) {
    monthlyParcel = (financedAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  const simPriceVal = document.getElementById('simPriceVal');
  const simDownVal = document.getElementById('simDownVal');
  const simParcelResult = document.getElementById('simParcelResult');

  if (simPriceVal) simPriceVal.innerText = `R$ ${vehiclePrice.toLocaleString('pt-BR')}`;
  if (simDownVal) simDownVal.innerText = `R$ ${downPayment.toLocaleString('pt-BR')}`;
  if (simParcelResult) simParcelResult.innerText = `R$ ${Math.round(monthlyParcel).toLocaleString('pt-BR')}/mês`;
}

function sendFinancingWhatsApp() {
  const priceVal = document.getElementById('simPriceVal').innerText;
  const downVal = document.getElementById('simDownVal').innerText;
  const parcelVal = document.getElementById('simParcelResult').innerText;
  const activeTermBtn = document.querySelector('.term-btn.active');
  const term = activeTermBtn ? activeTermBtn.dataset.term : '48';

  const text = encodeURIComponent(`Olá! Fiz uma simulação de financiamento no site da Alemãozinho Veículos:\n- Valor do Veículo: ${priceVal}\n- Entrada: ${downVal}\n- Plano: ${term}x de ${parcelVal}\n\nGostaria de consultar a aprovação do meu CPF!`);
  window.open(`https://wa.me/${STORE_WHATSAPP}?text=${text}`, '_blank');
}

function sendTradeInWhatsApp(event) {
  event.preventDefault();
  const name = document.getElementById('tradeName').value;
  const phone = document.getElementById('tradePhone').value;
  const car = document.getElementById('tradeCar').value;
  const year = document.getElementById('tradeYear').value;
  const km = document.getElementById('tradeKm').value;
  const notes = document.getElementById('tradeNotes').value;

  const text = encodeURIComponent(`Olá Alemãozinho Veículos! Gostaria de uma avaliação para venda/troca do meu veículo:\n\n👤 *Nome*: ${name}\n📞 *Telefone*: ${phone}\n🚗 *Carro*: ${car}\n📅 *Ano*: ${year}\n🛣️ *KM*: ${km}\n📝 *Observações*: ${notes}`);
  window.open(`https://wa.me/${STORE_WHATSAPP}?text=${text}`, '_blank');
}

function setupEventListeners() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilterCategory = e.target.dataset.category;
      renderInventory();
    });
  });

  const heroSearchInput = document.getElementById('heroSearchInput');
  if (heroSearchInput) {
    heroSearchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      renderInventory();
    });
  }

  const heroMakeSelect = document.getElementById('heroMakeSelect');
  if (heroMakeSelect) {
    heroMakeSelect.addEventListener('change', (e) => {
      currentMakeFilter = e.target.value;
      renderInventory();
    });
  }

  const heroTransSelect = document.getElementById('heroTransSelect');
  if (heroTransSelect) {
    heroTransSelect.addEventListener('change', (e) => {
      currentTransFilter = e.target.value;
      renderInventory();
    });
  }

  const heroPriceSelect = document.getElementById('heroPriceSelect');
  if (heroPriceSelect) {
    heroPriceSelect.addEventListener('change', (e) => {
      currentPriceFilter = e.target.value;
      renderInventory();
    });
  }

  const sortSelect = document.getElementById('inventorySortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderInventory();
    });
  }

  const priceInput = document.getElementById('simPriceRange');
  const downInput = document.getElementById('simDownRange');

  if (priceInput) priceInput.addEventListener('input', updateFinancingCalculation);
  if (downInput) downInput.addEventListener('input', updateFinancingCalculation);

  document.querySelectorAll('.term-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.term-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      updateFinancingCalculation();
    });
  });

  const modalOverlay = document.getElementById('carModalOverlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
}

function handleWhatsAppInterestClick(carId) {
  const car = allVehicles.find(v => v.id === carId);
  if (car && typeof recordLeadToCRM === 'function') {
    recordLeadToCRM({
      name: 'Cliente WhatsApp (Vitrine)',
      phone: '(16) 99215-0212',
      car: `${car.make} ${car.model} (${car.year})`,
      notes: `Clique no botão "Tenho Interesse" na vitrine. Valor: R$ ${car.price.toLocaleString('pt-BR')}`
    });
  }
}

function sendTradeInWhatsApp(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('tradeName')?.value || '';
  const phone = document.getElementById('tradePhone')?.value || '';
  const car = document.getElementById('tradeCar')?.value || '';
  const year = document.getElementById('tradeYear')?.value || '';
  const km = document.getElementById('tradeKm')?.value || '';
  const notes = document.getElementById('tradeNotes')?.value || '';

  if (typeof recordLeadToCRM === 'function') {
    recordLeadToCRM({
      name: name || 'Cliente Avaliação Troca',
      phone: phone || '(16) 99215-0212',
      car: car ? `${car} (${year})` : 'Veículo Usado para Troca',
      notes: `Solicitação de Avaliação / Venda de Usado no site. KM: ${km} | Obs: ${notes}`
    });
  }

  const msg = `Olá Alexandre! Gostaria de solicitar uma avaliação para VENDER / TROCAR meu veículo na Alemãozinho Veículos:\n\n` +
              `👤 *Nome:* ${name}\n` +
              `📱 *WhatsApp:* ${phone}\n` +
              `🚗 *Veículo:* ${car}\n` +
              `📅 *Ano:* ${year}\n` +
              `🛣️ *KM:* ${km}\n` +
              `📝 *Observações:* ${notes || 'Nenhuma'}`;

  const url = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}
