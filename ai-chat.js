/* ==========================================================================
   ALEMÃOZINHO VEÍCULOS - INTELIGÊNCIA ARTIFICIAL DE VENDAS VIRTUAL (AI SALES BOT)
   ========================================================================== */

const AI_BOT_CONFIG = {
  storeName: "Alemãozinho Veículos",
  ownerName: "Alexandre Mancini",
  phone: "(16) 99215-0212",
  whatsappNum: "5516992150212",
  address: "Rua Joaquim Ferreira Coelho, 560 – Centro, Pedregulho – SP",
  hours: "Seg a Sex: 08:30 às 18:00 | Sáb: 08:30 às 12:00"
};

class AlemaozinhoAIChat {
  constructor() {
    this.isOpen = false;
    this.vehiclesData = [];
    this.messages = [];
    this.init();
  }

  async init() {
    this.injectWidgetHTML();
    this.bindEvents();
    
    // Load live inventory
    if (typeof getCloudVehicles === 'function') {
      this.vehiclesData = await getCloudVehicles();
    } else if (typeof vehicles !== 'undefined') {
      this.vehiclesData = vehicles;
    }

    // Initial Welcome Message
    this.addBotMessage(
      `Olá! 👋 Sou o **Assistente Virtual da Alemãozinho Veículos**!\n\n` +
      `Estou aqui para te ajudar a encontrar o carro ideal, simular financiamentos ou agendar uma visita na nossa loja em Pedregulho - SP.\n\n` +
      `Como posso te ajudar hoje? (Ex: *"Quais SUVs vocês têm?"*, *"Aceitam troca?"*, *"Ver carros até R$ 100 mil"*`
    );
  }

  injectWidgetHTML() {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'alemaozinhoAiChatContainer';
    chatContainer.innerHTML = `
      <!-- Floating Trigger Button -->
      <button id="aiChatTrigger" class="ai-chat-trigger" title="Falar com Assistente Virtual IA">
        <div class="ai-trigger-badge">
          <span class="ai-pulse-dot"></span>
        </div>
        <img src="assets/logo.png" alt="Alemãozinho IA Logo" class="ai-trigger-icon">
        <span class="ai-trigger-text">Dúvidas? Fale com a IA</span>
      </button>

      <!-- Chat Modal Window -->
      <div id="aiChatWindow" class="ai-chat-window">
        <!-- Header -->
        <div class="ai-chat-header">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="ai-avatar-box">
              <img src="assets/logo.png" alt="IA Avatar">
            </div>
            <div>
              <div style="font-weight: 800; font-size: 1rem; color: #FFF; display: flex; align-items: center; gap: 0.4rem;">
                Alemãozinho IA <span class="ai-online-pill">ONLINE</span>
              </div>
              <div style="font-size: 0.75rem; color: #94A3B8;">Consultor Virtual de Vendas 24h</div>
            </div>
          </div>
          <button id="aiChatClose" class="ai-chat-close"><i class="fas fa-times"></i></button>
        </div>

        <!-- Messages Body -->
        <div id="aiChatMessages" class="ai-chat-messages">
          <!-- Rendered dynamically -->
        </div>

        <!-- Quick Action Chips -->
        <div class="ai-quick-chips">
          <button onclick="window.alemaozinhoAi.sendQuickPrompt('Ver todos os SUVs disponíveis')">🚙 SUVs em Estoque</button>
          <button onclick="window.alemaozinhoAi.sendQuickPrompt('Carros automáticos')">⚙️ Automáticos</button>
          <button onclick="window.alemaozinhoAi.sendQuickPrompt('Como funciona a troca?')">🔄 Avaliar Troca</button>
          <button onclick="window.alemaozinhoAi.sendQuickPrompt('Horário e endereço da loja')">📍 Onde Fica a Loja?</button>
        </div>

        <!-- Input Row -->
        <form id="aiChatForm" class="ai-chat-form" onsubmit="window.alemaozinhoAi.handleSubmit(event)">
          <input type="text" id="aiChatInput" placeholder="Digite sua dúvida ou o carro que procura..." autocomplete="off">
          <button type="submit" class="ai-chat-send-btn"><i class="fas fa-paper-plane"></i></button>
        </form>
      </div>
    `;
    document.body.appendChild(chatContainer);
  }

  bindEvents() {
    const trigger = document.getElementById('aiChatTrigger');
    const closeBtn = document.getElementById('aiChatClose');

    trigger.addEventListener('click', () => this.toggleChat());
    closeBtn.addEventListener('click', () => this.toggleChat(false));
  }

  toggleChat(forceState) {
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    const windowEl = document.getElementById('aiChatWindow');
    if (this.isOpen) {
      windowEl.classList.add('active');
      document.getElementById('aiChatInput').focus();
    } else {
      windowEl.classList.remove('active');
    }
  }

  sendQuickPrompt(text) {
    document.getElementById('aiChatInput').value = text;
    this.handleSubmit(new Event('submit'));
  }

  async handleSubmit(e) {
    e.preventDefault();
    const inputEl = document.getElementById('aiChatInput');
    const userText = inputEl.value.trim();
    if (!userText) return;

    this.addUserMessage(userText);
    inputEl.value = '';

    // Show Typing Indicator
    this.showTypingIndicator();

    // Generate Smart AI Response
    setTimeout(() => {
      this.hideTypingIndicator();
      const botResponse = this.generateSmartResponse(userText);
      this.addBotMessage(botResponse);
    }, 700);
  }

  addUserMessage(text) {
    const msgBox = document.getElementById('aiChatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'ai-msg ai-msg-user';
    msgDiv.innerText = text;
    msgBox.appendChild(msgDiv);
    this.scrollToBottom();
  }

  addBotMessage(textHTML) {
    const msgBox = document.getElementById('aiChatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'ai-msg ai-msg-bot';
    msgDiv.innerHTML = textHTML.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    msgBox.appendChild(msgDiv);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const msgBox = document.getElementById('aiChatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'aiTypingIndicator';
    typingDiv.className = 'ai-msg ai-msg-bot ai-typing';
    typingDiv.innerHTML = `<span>.</span><span>.</span><span>.</span> Alemãozinho IA está digitando...`;
    msgBox.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const el = document.getElementById('aiTypingIndicator');
    if (el) el.remove();
  }

  scrollToBottom() {
    const msgBox = document.getElementById('aiChatMessages');
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  /* AI INTEL SALES ENGINE LOGIC */
  generateSmartResponse(query) {
    const lower = query.toLowerCase();

    // 1. Specific Vehicle Inquiry (Tracker, Corolla, Compass, Toro, Polo, etc.)
    if (lower.includes('tracker')) {
      const tracker = this.vehiclesData.find(v => v.model.toLowerCase().includes('tracker')) || this.vehiclesData[0];
      return `Temos o incrível **${tracker.make} ${tracker.model}** (${tracker.year}) no estoque!\n\n` +
             `💰 **Preço:** R$ ${tracker.price.toLocaleString('pt-BR')}\n` +
             `🛣️ **KM:** ${tracker.km}\n` +
             `⚙️ **Câmbio:** ${tracker.transmission}\n` +
             `🛡️ **Garantia:** Laudo Cautelar Aprovado & Procedência\n\n` +
             `<a href="detalhes.html?id=${tracker.id}" class="ai-link-btn"><i class="fas fa-eye"></i> Ver Ficha Técnica Webmotors</a>` +
             `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Vim%20pelo%20Chat%20IA%20e%20quero%20saber%20mais%20do%20Tracker" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Falar com Alexandre no WhatsApp</a>`;
    }

    if (lower.includes('corolla')) {
      const corolla = this.vehiclesData.find(v => v.model.toLowerCase().includes('corolla'));
      if (corolla) {
        return `Temos o sensacional **${corolla.make} ${corolla.model}** (${corolla.year}) em estoque!\n\n` +
               `💰 **Preço:** R$ ${corolla.price.toLocaleString('pt-BR')}\n` +
               `🛣️ **KM:** ${corolla.km}\n\n` +
               `<a href="detalhes.html?id=${corolla.id}" class="ai-link-btn"><i class="fas fa-eye"></i> Ver Ficha Técnica</a>` +
               `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Corolla" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Negociar no WhatsApp</a>`;
      }
    }

    if (lower.includes('suv') || lower.includes('suvs')) {
      const suvs = this.vehiclesData.filter(v => v.bodyType === 'SUV');
      let reply = `Temos **${suvs.length} excelentes SUVs** prontos para entrega imediata:\n\n`;
      suvs.forEach(s => {
        reply += `🚘 **${s.make} ${s.model}** (${s.year}) - R$ ${s.price.toLocaleString('pt-BR')}\n`;
      });
      reply += `\n<a href="estoque.html" class="ai-link-btn"><i class="fas fa-car"></i> Ver Todos os SUVs no Estoque</a>`;
      return reply;
    }

    if (lower.includes('automático') || lower.includes('automatico') || lower.includes('automatica')) {
      const autos = this.vehiclesData.filter(v => v.transmission === 'Automático');
      let reply = `Temos **${autos.length} veículos com câmbio automático** no estoque:\n\n`;
      autos.slice(0, 3).forEach(a => {
        reply += `🚗 **${a.make} ${a.model}** (${a.year}) - R$ ${a.price.toLocaleString('pt-BR')}\n`;
      });
      reply += `\n<a href="estoque.html" class="ai-link-btn"><i class="fas fa-filter"></i> Filtrar Estoque Completo</a>`;
      return reply;
    }

    if (lower.includes('100 mil') || lower.includes('100k') || lower.includes('barato') || lower.includes('ate 100')) {
      const under100 = this.vehiclesData.filter(v => v.price <= 100000);
      if (under100.length > 0) {
        let reply = `Encontrei veículos incríveis até R$ 100.000:\n\n`;
        under100.forEach(u => {
          reply += `✨ **${u.make} ${u.model}** (${u.year}) - R$ ${u.price.toLocaleString('pt-BR')}\n`;
        });
        return reply;
      }
    }

    // 2. Financing & Installment Inquiry
    if (lower.includes('financiamento') || lower.includes('parcela') || lower.includes('simular') || lower.includes('entrada')) {
      return `Trabalhamos com os melhores bancos de financiamento do mercado, incluindo **Santander Financiamentos**, com taxas exclusivas!\n\n` +
             `💡 **Exemplo de Simulação (30% Entrada):**\n` +
             `• **Entrada:** R$ 29.400\n` +
             `• **Saldo:** 48x de R$ 1.950/mês*\n\n` +
             `Deseja simular o seu CPF sem compromisso direto com o **Alexandre Mancini**?\n\n` +
             `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Vim%20pelo%20Chat%20IA%20e%20gostaria%20de%20SIMULAR%20UM%20FINANCIAMENTO" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Simular Agora no WhatsApp</a>`;
    }

    // 3. Trade-in / Sell Inquiry
    if (lower.includes('troca') || lower.includes('trocar') || lower.includes('vender') || lower.includes('avaliar')) {
      return `Sim! **Aceitamos o seu veículo seminovo na troca** com a melhor avaliação da região de Pedregulho - SP!\n\n` +
             `Para avaliarmos o seu carro hoje mesmo, envie o modelo, ano e quilometragem para a nossa equipe:\n\n` +
             `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Gostaria%20de%20AVALIAR%20MEU%20CARRO%20NA%20TROCA" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Enviar Dados do Meu Carro</a>`;
    }

    // 4. Store Address & Working Hours Inquiry
    if (lower.includes('onde') || lower.includes('endereço') || lower.includes('endereco') || lower.includes('horario') || lower.includes('loja') || lower.includes('localização')) {
      return `📍 **Endereço da Loja:**\n${AI_BOT_CONFIG.address}\n\n` +
             `⏰ **Horário de Atendimento:**\n${AI_BOT_CONFIG.hours}\n\n` +
             `📱 **WhatsApp Principal:** ${AI_BOT_CONFIG.phone}\n\n` +
             `<a href="https://maps.google.com/?q=${encodeURIComponent(AI_BOT_CONFIG.address)}" target="_blank" class="ai-link-btn"><i class="fas fa-map-marked-alt"></i> Ver no Google Maps</a>`;
    }

    // Default Helpful Sales Response
    return `Tenho acesso em tempo real a todo o nosso estoque de veículos revisados e com garantia!\n\n` +
           `Você pode me perguntar sobre modelos específicos, valores de financiamento ou agendar uma visita com o **Alexandre** na nossa loja.\n\n` +
           `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Estou%20no%20site%20e%20gostaria%20de%20atendimento" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Falar com Alexandre no WhatsApp</a>`;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.alemaozinhoAi = new AlemaozinhoAIChat();
});
