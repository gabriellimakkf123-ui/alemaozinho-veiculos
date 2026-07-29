const https = require('https');

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

// Test JsonBlob PUT
const blobId = '019fb029-b1e0-782e-b56f-fc6b311cef83';
const data = JSON.stringify(INITIAL_VEHICLES);

const options = {
  hostname: 'jsonblob.com',
  port: 443,
  path: `/api/jsonBlob/${blobId}`,
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  console.log('PUT Status:', res.statusCode);
  
  // Verify GET
  https.get(`https://jsonblob.com/api/jsonBlob/${blobId}`, (resGet) => {
    let raw = '';
    resGet.on('data', chunk => raw += chunk);
    resGet.on('end', () => {
      console.log('GET Length:', raw.length);
      console.log('Parsed items:', JSON.parse(raw).length);
    });
  });
});

req.write(data);
req.end();
