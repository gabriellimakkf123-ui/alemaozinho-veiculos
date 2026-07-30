/* ==========================================================================
   ALEMÃOZINHO VEÍCULOS - JAVASCRIPT PUBLIC SHOWROOM LOGIC WITH CLOUD DB
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

  // Periodic polling for cloud updates every 15 seconds
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

  if (currentSort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'km-asc') {
    filtered.sort((a, b) => a.kmNum - b.kmNum);
  } else if (currentSort === 'year-desc') {
    filtered.sort((a, b) => b.yearNum - a.yearNum);
  }

  // LIMIT TO MAXIMUM 4 CARS ON HOME PAGE
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

  container.innerHTML = filtered.map(car => {
    const parcelEst = Math.round((car.price * 0.7) / 48 * 1.18);
    const waText = encodeURIComponent(`Olá! Vi o veículo ${car.make} ${car.model} (${car.year}) por R$ ${car.price.toLocaleString('pt-BR')} no site da Alemãozinho Veículos e gostaria de mais informações!`);
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
          <div class="car-year">${car.year} • ${car.bodyType}</div>
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
              <div style="color: var(--accent-green); font-weight: 700;">R$ ${parcelEst.toLocaleString('pt-BR')}/mês</div>
            </div>
            <div class="price-main">R$ ${car.price.toLocaleString('pt-BR')}</div>
          </div>

          <div class="car-actions">
            <button onclick="openCarModal(${car.id})" class="btn-outline" style="width:100%; justify-content:center;">
              <i class="fas fa-eye"></i> Detalhes
            </button>
            <a href="${waUrl}" target="_blank" class="btn-whatsapp" style="justify-content:center;">
              <i class="fab fa-whatsapp"></i> Tenho Interesse
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
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
  const car = vehicles.find(c => c.id === id);
  if (!car) return;

  const modalOverlay = document.getElementById('carModalOverlay');
  const modalBody = document.getElementById('modalBody');

  const parcel48 = Math.round((car.price * 0.7) / 48 * 1.18);
  const waText = encodeURIComponent(`Olá! Gostaria de agendar um test drive ou simular financiamento para o ${car.make} ${car.model} (${car.year}) de R$ ${car.price.toLocaleString('pt-BR')}.`);
  const waUrl = `https://wa.me/${STORE_WHATSAPP}?text=${waText}`;

  const optionalsList = car.optionals || ['Ar Condicionado', 'Direção Hidráulica/Elétrica', 'Freios ABS', 'Airbags', 'Alarme Central'];

  modalBody.innerHTML = `
    <div class="modal-grid">
      <div>
        <img src="${car.img}" alt="${car.make} ${car.model}" class="modal-gallery-img">
      </div>
      <div>
        <div style="color: var(--primary); font-weight: 700; font-size: 0.9rem; text-transform: uppercase;">
          ${car.year} • ${car.bodyType} • Cor ${car.color || 'Prata'}
        </div>
        <h2 style="font-size: 1.8rem; margin: 0.25rem 0 1rem 0;">${car.make} ${car.model}</h2>
        <div style="font-size: 2.2rem; font-family: var(--font-heading); font-weight: 800; color: #FFF; margin-bottom: 1rem;">
          R$ ${car.price.toLocaleString('pt-BR')}
        </div>

        <div class="car-specs" style="margin-bottom: 1.5rem;">
          <div class="spec-item"><i class="fas fa-tachometer-alt"></i><span>${car.km}</span></div>
          <div class="spec-item"><i class="fas fa-cog"></i><span>${car.transmission}</span></div>
          <div class="spec-item"><i class="fas fa-gas-pump"></i><span>${car.fuel}</span></div>
        </div>

        <h4 style="margin-bottom: 0.5rem; font-size: 1rem;"><i class="fas fa-check-circle" style="color:var(--primary)"></i> Opcionais e Itens de Série:</h4>
        <div class="optionals-grid">
          ${optionalsList.map(opt => `<span><i class="fas fa-check"></i> ${opt}</span>`).join('')}
        </div>

        <div style="background: rgba(229,9,20,0.1); border: 1px solid rgba(229,9,20,0.3); padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem;">
          <div style="font-size: 0.85rem; color: var(--text-muted);">Simulação de Parcela Sugerida (30% Entrada):</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--accent-green);">48x de R$ ${parcel48.toLocaleString('pt-BR')}/mês</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <a href="${waUrl}" target="_blank" class="btn-whatsapp" style="justify-content: center; width: 100%;">
            <i class="fab fa-whatsapp"></i> Negociar este Veículo no WhatsApp
          </a>
          <button onclick="scrollToFinancing(${car.price})" class="btn-primary" style="justify-content: center; width: 100%;">
            <i class="fas fa-calculator"></i> Simular Outros Valores de Entrada
          </button>
        </div>
      </div>
    </div>
  `;

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modalOverlay = document.getElementById('carModalOverlay');
  if (modalOverlay) modalOverlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function scrollToFinancing(price) {
  closeModal();
  const priceInput = document.getElementById('simPriceRange');
  if (priceInput) {
    priceInput.value = price;
    updateFinancingCalculation();
    document.getElementById('financiamento')?.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.location.href = `index.html#financiamento`;
  }
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

  document.getElementById('simPriceVal').innerText = `R$ ${vehiclePrice.toLocaleString('pt-BR')}`;
  document.getElementById('simDownVal').innerText = `R$ ${downPayment.toLocaleString('pt-BR')}`;
  document.getElementById('simParcelResult').innerText = `R$ ${Math.round(monthlyParcel).toLocaleString('pt-BR')}/mês`;
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
