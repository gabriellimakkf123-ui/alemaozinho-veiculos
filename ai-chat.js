/* ==========================================================================
   ALEMÃOZINHO VEÍCULOS - INTELIGÊNCIA ARTIFICIAL DE VENDAS VIRTUAL (AI SALES BOT)
   BANCO DE RESPOSTAS AVANÇADO E TREINAMENTO DE LINGUAGEM NATURAL
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
    
    // Load live inventory from Cloud DB or local storage
    if (typeof getCloudVehicles === 'function') {
      this.vehiclesData = await getCloudVehicles();
    } else if (typeof vehicles !== 'undefined') {
      this.vehiclesData = vehicles;
    }

    // Initial Welcome Message
    this.addBotMessage(
      `Olá! 👋 Sou o **Assistente Virtual da Alemãozinho Veículos**!\n\n` +
      `Estou aqui para tirar qualquer dúvida, te ajudar a escolher o carro ideal, simular financiamentos ou agendar seu Test Drive em Pedregulho - SP.\n\n` +
      `Como posso te ajudar hoje? (Ex: *"Quais SUVs vocês têm?"*, *"Aceitam consórcio?"*, *"Entregam em Franca?"*)`
    );
  }

  injectWidgetHTML() {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'alemaozinhoAiChatContainer';
    chatContainer.innerHTML = `
      <!-- Floating Trigger Button (Positioned on the Left - No Overlap) -->
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
          <button onclick="window.alemaozinhoAi.sendQuickPrompt('Aceitam consórcio ou troca?')">🔄 Troca & Consórcio</button>
          <button onclick="window.alemaozinhoAi.sendQuickPrompt('Entregam em Franca e região?')">🚚 Entregas na Região</button>
          <button onclick="window.alemaozinhoAi.sendQuickPrompt('Horário e endereço da loja')">📍 Onde Fica a Loja?</button>
        </div>

        <!-- Input Form -->
        <form id="aiChatForm" class="ai-chat-form" onsubmit="window.alemaozinhoAi.handleSubmit(event)">
          <input type="text" id="aiChatInput" placeholder="Pergunte qualquer coisa sobre nossos carros..." autocomplete="off">
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
    }, 600);
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
    typingDiv.innerHTML = `<span>.</span><span>.</span><span>.</span> Alemãozinho IA está analisando...`;
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

  /* ADVANCED NATURAL LANGUAGE AI KNOWLEDGE BASE & RESPONSE ENGINE */
  generateSmartResponse(query) {
    const q = query.toLowerCase();

    // 1. SPECIFIC VEHICLE LOOKUPS (Tracker, Corolla, Compass, Toro, Polo)
    if (q.includes('tracker')) {
      const tracker = this.vehiclesData.find(v => v.model.toLowerCase().includes('tracker')) || this.vehiclesData[0];
      return `Temos o excelente **${tracker.make} ${tracker.model}** (${tracker.year}) no estoque!\n\n` +
             `💰 **Preço:** R$ ${tracker.price.toLocaleString('pt-BR')}\n` +
             `📊 **Tabela FIPE Oficial:** R$ ${(tracker.fipePrice || 96840).toLocaleString('pt-BR')}\n` +
             `🛣️ **KM:** ${tracker.km}\n` +
             `⚙️ **Câmbio:** ${tracker.transmission}\n` +
             `🛡️ **Garantia:** Laudo Cautelar Aprovado\n\n` +
             `<a href="detalhes.html?id=${tracker.id}" class="ai-link-btn"><i class="fas fa-eye"></i> Ver Ficha Técnica Webmotors</a>` +
             `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Vim%20pelo%20Chat%20IA%20e%20tenho%20interesse%20no%20Chevrolet%20Tracker" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Falar com Alexandre no WhatsApp</a>`;
    }

    if (q.includes('corolla')) {
      const corolla = this.vehiclesData.find(v => v.model.toLowerCase().includes('corolla'));
      if (corolla) {
        return `Temos o impecável **${corolla.make} ${corolla.model}** (${corolla.year}) disponível!\n\n` +
               `💰 **Preço:** R$ ${corolla.price.toLocaleString('pt-BR')}\n` +
               `📊 **Tabela FIPE:** R$ ${(corolla.fipePrice || 114500).toLocaleString('pt-BR')}\n` +
               `🛣️ **KM:** ${corolla.km}\n\n` +
               `<a href="detalhes.html?id=${corolla.id}" class="ai-link-btn"><i class="fas fa-eye"></i> Ver Ficha Técnica</a>` +
               `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Corolla" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Negociar no WhatsApp</a>`;
      }
    }

    if (q.includes('compass')) {
      const compass = this.vehiclesData.find(v => v.model.toLowerCase().includes('compass'));
      if (compass) {
        return `Temos o sofisticado **${compass.make} ${compass.model}** (${compass.year})!\n\n` +
               `💰 **Preço:** R$ ${compass.price.toLocaleString('pt-BR')}\n` +
               `🛣️ **KM:** ${compass.km}\n\n` +
               `<a href="detalhes.html?id=${compass.id}" class="ai-link-btn"><i class="fas fa-eye"></i> Ver Ficha Técnica</a>` +
               `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Jeep%20Compass" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Falar no WhatsApp</a>`;
      }
    }

    if (q.includes('toro') || q.includes('picape') || q.includes('pickup')) {
      const toro = this.vehiclesData.find(v => v.model.toLowerCase().includes('toro'));
      if (toro) {
        return `Temos a robusta **${toro.make} ${toro.model}** (${toro.year})!\n\n` +
               `💰 **Preço:** R$ ${toro.price.toLocaleString('pt-BR')}\n` +
               `🛣️ **KM:** ${toro.km}\n\n` +
               `<a href="detalhes.html?id=${toro.id}" class="ai-link-btn"><i class="fas fa-eye"></i> Ver Ficha Técnica</a>` +
               `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Tenho%20interesse%20na%20Fiat%20Toro" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Negociar no WhatsApp</a>`;
      }
    }

    // 2. CATEGORY / BODY TYPE LOOKUPS (SUVs, Automáticos, Hatchs, Sedans)
    if (q.includes('suv') || q.includes('suvs') || q.includes('utilitario')) {
      const suvs = this.vehiclesData.filter(v => v.bodyType === 'SUV');
      let reply = `Temos **${suvs.length} excelentes SUVs** revisados com procedência no estoque:\n\n`;
      suvs.forEach(s => {
        reply += `🚘 **${s.make} ${s.model}** (${s.year}) - R$ ${s.price.toLocaleString('pt-BR')}\n`;
      });
      reply += `\n<a href="estoque.html" class="ai-link-btn"><i class="fas fa-car"></i> Ver Todos os SUVs em Estoque</a>`;
      return reply;
    }

    if (q.includes('automático') || q.includes('automatico') || q.includes('automatica')) {
      const autos = this.vehiclesData.filter(v => v.transmission === 'Automático');
      let reply = `Temos **${autos.length} veículos com câmbio automático** prontos para rodar:\n\n`;
      autos.slice(0, 4).forEach(a => {
        reply += `🚗 **${a.make} ${a.model}** (${a.year}) - R$ ${a.price.toLocaleString('pt-BR')}\n`;
      });
      reply += `\n<a href="estoque.html" class="ai-link-btn"><i class="fas fa-filter"></i> Filtrar Estoque Completo</a>`;
      return reply;
    }

    if (q.includes('100 mil') || q.includes('100k') || q.includes('ate 100') || q.includes('barato') || q.includes('mais barato')) {
      const under100 = this.vehiclesData.filter(v => v.price <= 100000);
      if (under100.length > 0) {
        let reply = `Encontrei ótimas opções até R$ 100.000 no estoque:\n\n`;
        under100.forEach(u => {
          reply += `✨ **${u.make} ${u.model}** (${u.year}) - R$ ${u.price.toLocaleString('pt-BR')}\n`;
        });
        return reply;
      }
    }

    // 3. REGIONAL DELIVERIES & CITIES (Franca, Rifaina, Cristais Paulista, Batatais, Ribeirão Preto, Região)
    if (q.includes('entrega') || q.includes('entregam') || q.includes('frete') || q.includes('franca') || q.includes('rifaina') || q.includes('regiao') || q.includes('região') || q.includes('cidade') || q.includes('buscar')) {
      return `🚚 **Sim! Entregamos em toda a região de Pedregulho, Franca, Rifaina, Cristais Paulista e arredores!**\n\n` +
             `Você pode fazer a negociação 100% online ou vir até a nossa loja em Pedregulho. Se preferir, levamos o carro até você ou te buscamos na nossa concessionária com toda a segurança!\n\n` +
             `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Gostaria%20de%20saber%20sobre%20a%20ENTREGA%20do%20ve%C3%ADculo%20na%20minha%20cidade" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Combinar Entrega no WhatsApp</a>`;
    }

    // 4. CONSÓRCIO & CARTA DE CRÉDITO
    if (q.includes('consórcio') || q.includes('consorcio') || q.includes('carta') || q.includes('contemplada') || q.includes('credito') || q.includes('crédito')) {
      return `📜 **Sim! Aceitamos cartas de crédito contempladas de qualquer consórcio!**\n\n` +
             `Trabalhamos com Bradesco, Itaú, Porto Seguro, Santander, Caixa, Banco do Brasil e administradoras independentes. Cuidamos de todo o processo de faturamento e transferência para você acelerar de carro novo!\n\n` +
             `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Tenho%20uma%20CARTA%20DE%20CR%C3%89DITO%20de%20Cons%C3%B3rcio%20e%20quero%20comprar%20um%20carro" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Faturar Carta de Crédito</a>`;
    }

    // 5. GARANTIA, LAUDO CAUTELAR & PROCEDÊNCIA
    if (q.includes('garantia') || q.includes('laudo') || q.includes('cautelar') || q.includes('revisado') || q.includes('revisão') || q.includes('revisao') || q.includes('procedencia') || q.includes('procedência') || q.includes('seguro') || q.includes('confiavel') || q.includes('confiável')) {
      return `🛡️ **Tranquilidade Absoluta e Transparência:**\n\n` +
             `• **Laudo Cautelar Aprovado:** 100% dos nossos veículos passam por perícia técnica rigorosa;\n` +
             `• **Garantia de Procedência:** Checagem de histórico de sinistro, leilão e documentação;\n` +
             `• **Revisados:** Carros prontos para viagem com revisão mecânica em dia.\n\n` +
             `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Gostaria%20de%20ver%20o%20laudo%20cautelar%20de%20um%20ve%C3%ADculo" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Solicitar Laudo no WhatsApp</a>`;
    }

    // 6. CARTÃO DE CRÉDITO & PARCELAMENTO DE ENTRADA
    if (q.includes('cartão') || q.includes('cartao') || q.includes('maquininha') || q.includes('maquina') || q.includes('parcelar entrada')) {
      return `💳 **Facilitamos sua compra no Cartão de Crédito!**\n\n` +
             `Você pode parcelar a entrada do seu veículo (ou o valor total) em **até 18x no cartão de crédito** com as melhores condições da região!\n\n` +
             `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Quero%20saber%20as%20condi%C3%A7%C3%B5es%20de%20parcelamento%20no%20CART%C3%83O%20DE%20CR%C3%89DITO" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Consultar Parcelamento no Cartão</a>`;
    }

    // 7. TEST DRIVE & VISITAS NA LOJA
    if (q.includes('test') || q.includes('drive') || q.includes('ver') || q.includes('visita') || q.includes('agendar') || q.includes('andar') || q.includes('experimentar') || q.includes('olhar')) {
      return `☕ **Venha tomar um café conosco e fazer um Test Drive!**\n\n` +
             `📍 **Endereço:** ${AI_BOT_CONFIG.address}\n` +
             `⏰ **Horário:** ${AI_BOT_CONFIG.hours}\n\n` +
             `Gostaria de agendar um horário com o **Alexandre Mancini** para deixar o carro pronto para seu Test Drive?\n\n` +
             `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Gostaria%20de%20AGENDAR%20UM%20TEST%20DRIVE" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Agendar Test Drive no WhatsApp</a>`;
    }

    // 8. FINANCIAMENTO, APURAÇÃO DE CPF & SANTANDER
    if (q.includes('financiamento') || q.includes('parcela') || q.includes('simular') || q.includes('entrada') || q.includes('juros') || q.includes('santander') || q.includes('banco') || q.includes('sem entrada') || q.includes('autonomo') || q.includes('autônomo') || q.includes('cpf')) {
      return `🏦 **Financiamento Rápido com Aprovação Descomplicada!**\n\n` +
             `Trabalhamos com o **Santander Financiamentos** e os maiores bancos do Brasil. Aprovamos para autônomos, aposentados e sem comprovação de renda formal!\n\n` +
             `💡 **Exemplo de Parcela (30% Entrada):**\n` +
             `• Saldo em até 48x ou 60x fixas no carnê/débito.\n\n` +
             `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Quero%20SIMULAR%20MEU%20FINANCIAMENTO%20no%20Santander" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Simular Agora no WhatsApp</a>`;
    }

    // 9. AVALIAÇÃO DE TROCA & VENDA DO CARRO À VISTA
    if (q.includes('troca') || q.includes('trocar') || q.includes('vender') || q.includes('avaliar') || q.includes('compram') || q.includes('dinheiro')) {
      return `🔄 **Aceitamos seu Seminovo na Troca com Avaliação Justa!**\n\n` +
             `Também **compramos seu veículo à vista** com pagamento no Pix na hora, ou vendemos em consignação no nosso showroom.\n\n` +
             `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Gostaria%20de%20AVALIAR%20MEU%20VE%C3%8DCULO%20para%20troca%2Fvenda" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Enviar Fotos do Meu Carro no WhatsApp</a>`;
    }

    // 10. DESCONTO / NEGOCIAÇÃO À VISTA
    if (q.includes('desconto') || q.includes('à vista') || q.includes('a vista') || q.includes('menor preço') || q.includes('menor preco') || q.includes('proposta') || q.includes('oferta') || q.includes('choro')) {
      return `🤝 **Temos margem para ótimas negociações no pagamento à vista ou com boa entrada!**\n\n` +
             `Fale diretamente com o proprietário **Alexandre Mancini** para alinhar sua proposta:\n\n` +
             `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Tenho%20uma%20PROPOSTA%20%C0%20VISTA%20para%20um%20ve%C3%ADculo" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Enviar Proposta para Alexandre</a>`;
    }

    // 11. ENDEREÇO & CONTATO
    if (q.includes('onde') || q.includes('endereço') || q.includes('endereco') || q.includes('horario') || q.includes('horário') || q.includes('loja') || q.includes('localização') || q.includes('localizacao') || q.includes('telefone') || q.includes('contato')) {
      return `📍 **Alemãozinho Veículos / Alemãozinho Negócios**\n\n` +
             `🏢 **Endereço:** ${AI_BOT_CONFIG.address}\n` +
             `⏰ **Horário:** ${AI_BOT_CONFIG.hours}\n` +
             `📱 **WhatsApp:** ${AI_BOT_CONFIG.phone}\n\n` +
             `<a href="https://maps.google.com/?q=${encodeURIComponent(AI_BOT_CONFIG.address)}" target="_blank" class="ai-link-btn"><i class="fas fa-map-marked-alt"></i> Abrir no Google Maps</a>`;
    }

    // 12. SAUDAÇÕES & AGRADECIMENTOS (Obrigado, Valeu, Bom dia, Boa tarde, Olá, Oi)
    if (q.includes('obrigad') || q.includes('valeu') || q.includes('show') || q.includes('top') || q.includes('ótimo') || q.includes('otimo')) {
      return `Por nada! 😊 Estou sempre à disposição para te ajudar. Fique à vontade para perguntar sobre qualquer veículo do estoque!\n\n` +
             `<a href="estoque.html" class="ai-link-btn"><i class="fas fa-car"></i> Explorar Estoque Completo</a>`;
    }

    if (q.includes('bom dia') || q.includes('boa tarde') || q.includes('boa noite') || q.includes('ola') || q.includes('olá') || q.includes('oi')) {
      return `Olá! Seja muito bem-vindo à **Alemãozinho Veículos**! 👋\n\nComo posso te ajudar hoje? Você pode me perguntar sobre carros em estoque, financiamento, trocas ou agendamento de visitas!`;
    }

    // DEFAULT HELPFUL SALES FALLBACK
    return `Estou conectado em tempo real a todo o nosso estoque em Pedregulho - SP!\n\n` +
           `Você pode me perguntar sobre **modelos específicos (Tracker, Corolla, SUVs)**, **condições de financiamento**, **aceitação de trocas** ou pedir o endereço da loja.\n\n` +
           `<a href="https://wa.me/${AI_BOT_CONFIG.whatsappNum}?text=Ol%C3%A1!%20Estou%20no%20site%20e%20gostaria%20de%20atendimento" target="_blank" class="ai-wa-btn"><i class="fab fa-whatsapp"></i> Falar com Alexandre no WhatsApp</a>`;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.alemaozinhoAi = new AlemaozinhoAIChat();

  // GLOBAL AUTOMATIC CRM LEAD CAPTURE ON ANY WHATSAPP BUTTON CLICK
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"], .btn-whatsapp, .ai-wa-btn');
    if (target && typeof recordLeadToCRM === 'function') {
      let carName = 'Veículo do Estoque (Site)';
      
      const detailTitle = document.getElementById('wmDetailTitle');
      if (detailTitle) carName = detailTitle.innerText.trim();

      recordLeadToCRM({
        name: 'Cliente WhatsApp (Captura Automática)',
        phone: '(16) 99215-0212',
        car: carName,
        notes: `Clique automático no botão do WhatsApp: "${target.innerText.trim() || 'WhatsApp'}". Origem: ${window.location.pathname}`
      });
    }
  });
});
