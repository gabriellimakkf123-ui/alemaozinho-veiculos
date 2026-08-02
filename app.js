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
            <a href="${waUrl}" target="_blank" class="btn-whatsapp" style="justify-content:center; padding: 0.6rem; font-size: 0.85rem;">
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
  const car = vehicles.find(c => c.id === id);
  if (!car) return;

  const modalOverlay = document.getElementById('carModalOverlay');
  const modalBody = document.getElementById('modalBody');

  const parcel48 = Math.round((car.price * 0.7) / 48 * 1.18);
  const waText = encodeURIComponent(`Olá! Estou vendo a ficha técnica do ${car.make} ${car.model} (${car.year}) por R$ ${car.price.toLocaleString('pt-BR')} no padrão Webmotors e gostaria de negociar!`);
  const waUrl = `https://wa.me/${STORE_WHATSAPP}?text=${waText}`;

  const optionalsList = car.optionals || [
    'Ar Condicionado Digital', 'Direção Elétrica Proporcional', 'Freios ABS com EBD',
    'Airbags Frontais e Laterais', 'Alarme com Acionamento à Distância', 'Central Multimídia Touchscreen',
    'Conectividade Bluetooth & Apple CarPlay', 'Câmera de Ré com Sensores', 'Vidros e Travas Elétricas nas 4 Portas'
  ];

  modalBody.innerHTML = `
    <div class="modal-grid">
      <div>
        <img src="${car.img}" alt="${car.make} ${car.model}" class="modal-gallery-img" id="mainModalGalleryImg">
        
        <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
          <img src="${car.img}" onclick="document.getElementById('mainModalGalleryImg').src='${car.img}'" style="width: 75px; height: 50px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid var(--primary);">
          <img src="assets/storefront.webp" onclick="document.getElementById('mainModalGalleryImg').src='assets/storefront.webp'" style="width: 75px; height: 50px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 1px solid var(--border-light); opacity: 0.8;">
        </div>

        <div class="webmotors-dealer-box">
          <img src="assets/logo.png" style="height: 38px; width: auto;">
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: #FFF;">Alemãozinho Veículos</div>
            <div style="font-size: 0.8rem; color: var(--accent-green); font-weight: 600;"><i class="fas fa-check-circle"></i> Concessionária Verificada • Pedregulho - SP</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">Atendimento no Showroom Presencial ou via WhatsApp</div>
          </div>
        </div>
      </div>

      <div>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
          <span class="badge badge-red">${car.badge || 'Seminovo Selecionado'}</span>
          <span class="badge badge-dark"><i class="fas fa-shield-alt"></i> Laudo Cautelar Aprovado</span>
          <span class="badge badge-gold"><i class="fas fa-certificate"></i> Procedência Garantida</span>
        </div>

        <h2 style="font-size: 1.8rem; margin: 0.25rem 0 0.25rem 0;">${car.make} ${car.model}</h2>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">${car.year} • ${car.bodyType} • Cor ${car.color || 'Prata'} • Final de Placa *</div>

        <div style="font-size: 2.2rem; font-family: var(--font-heading); font-weight: 800; color: #FFF; margin-bottom: 1rem;">
          R$ ${car.price.toLocaleString('pt-BR')}
        </div>

        <div class="car-specs" style="margin-bottom: 1.25rem; background: var(--bg-card); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
          <div class="spec-item"><i class="fas fa-tachometer-alt" style="color:var(--primary);"></i><span>${car.km}</span></div>
          <div class="spec-item"><i class="fas fa-cog" style="color:var(--primary);"></i><span>${car.transmission}</span></div>
          <div class="spec-item"><i class="fas fa-gas-pump" style="color:var(--primary);"></i><span>${car.fuel}</span></div>
        </div>

        <h4 style="margin-bottom: 0.5rem; font-size: 0.95rem; color: #FFF;"><i class="fas fa-list-check" style="color:var(--primary)"></i> Ficha Técnica e Opcionais Webmotors:</h4>
        <div class="optionals-grid">
          ${optionalsList.map(opt => `<span><i class="fas fa-check"></i> ${opt}</span>`).join('')}
        </div>

        <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); padding: 1rem; border-radius: 12px; margin-bottom: 1.25rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Simulação Bancária Sugerida (30% Entrada):</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--accent-green);">48x de R$ ${parcel48.toLocaleString('pt-BR')}/mês</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button onclick="openFinancingForm(${car.id})" class="btn-primary" style="justify-content: center; width: 100%; background: linear-gradient(135deg, #10B981, #059669); border-color: #10B981; font-size: 1.05rem;">
            <i class="fas fa-calculator"></i> Simular Financiamento Deste Veículo
          </button>
          <a href="${waUrl}" target="_blank" class="btn-whatsapp" style="justify-content: center; width: 100%; font-size: 1.05rem;">
            <i class="fab fa-whatsapp"></i> Falar com o Vendedor no WhatsApp
          </a>
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

function sendTradeInWhatsApp(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('tradeName')?.value || '';
  const phone = document.getElementById('tradePhone')?.value || '';
  const car = document.getElementById('tradeCar')?.value || '';
  const year = document.getElementById('tradeYear')?.value || '';
  const km = document.getElementById('tradeKm')?.value || '';
  const notes = document.getElementById('tradeNotes')?.value || '';

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
