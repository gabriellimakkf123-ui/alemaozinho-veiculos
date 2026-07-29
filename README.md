# 🏎️ Alemãozinho Veículos - Web Platform & Dealer Admin Portal

Protótipo web de altíssimo padrão desenvolvido para a concessionária **Alemãozinho Veículos** (Pedregulho - SP). A plataforma conta com uma **Vitrine Interativa para Clientes** com filtro ao vivo e calculadora de financiamento, e um **Painel de Gestão para Lojistas (Dealer Admin)** restrito por senha.

---

## ✨ Funcionalidades Principais

### 🚘 1. Vitrine do Cliente (`index.html`)
- **Design System Premium**: Dark Mode luxury com glassmorphism, tipografia Outfit/Inter e iluminação Crimson Red (`#E50914`).
- **Fachada Real da Loja**: Imagem em alta resolução da loja física em Pedregulho - SP com enquadramento frontal reto e letreiro em destaque.
- **Filtros e Busca em Tempo Real**: Busca instantânea por palavra-chave, marca, câmbio, faixa de preço e categoria (SUVs, Sedans, Hatchs, Pickups, Destaques).
- **Calculadora de Financiamento**: Simulação dinâmica de entrada, prazo (24x a 60x) e cálculo estimado de parcelas.
- **Formulário de Troca / Avaliação**: Coleta de dados do seminovo com envio direto via WhatsApp formatado.
- **Modal de Detalhes**: Ficha técnica completa, itens de série/opcionais e foto ampliada.
- **Integração WhatsApp Direct**: Links diretos com mensagens pré-formatadas para o atendimento da loja `(16) 99215-0212`.

### 🔑 2. Área do Dealer / Lojista (`admin.html`)
- **Acesso Restrito com Autenticação**: Tela de bloqueio com senha PIN (`alemao2026`).
- **Métricas do Estoque**: Painel com Total de Veículos, Valor Total do Estoque, Quantidade Disponível e Vendidos.
- **Gerenciamento Completo de Veículos (CRUD)**:
  - ➕ Adicionar novos veículos com fotos, preço, KM, marca e opcionais.
  - ✏️ Editar veículos existentes.
  - 🏷️ Alternar status de "Vendido" / "Disponível".
  - 🗑️ Excluir veículos do estoque.
- **Sincronização em Tempo Real**: Compartilha estado via `localStorage`, atualizando instantaneamente a vitrine pública do cliente.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3 Vanilla**: Layout flexível, Grid responsivo e CSS Custom Properties.
- **JavaScript ES6+**: Manipulação do DOM, manipulação de estado em `localStorage`, eventos de `storage` cross-tab e formulários dinâmicos.
- **FontAwesome 6**: Ícones vetoriais modernos.
- **Google Fonts**: Tipografias *Outfit* e *Inter*.

---

## 🚀 Como Executar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/gabriellimakkf123-ui/alemaozinho-veiculos.git
cd alemaozinho-veiculos
```

2. Execute um servidor estático local (como `serve` ou `live-server`):
```bash
npx serve -l 3000
```

3. Acesse no navegador:
- **Vitrine pública**: `http://localhost:3000`
- **Painel do Lojista**: `http://localhost:3000/admin.html` *(Senha: `alemao2026`)*

---

## 📍 Informações do Cliente

- **Loja**: Alemãozinho Veículos
- **Endereço**: Rua Joaquim Ferreira Coelho, 560 – Centro, Pedregulho – SP
- **WhatsApp**: (16) 99215-0212

© 2026 Alemãozinho Veículos. Todos os direitos reservados.
