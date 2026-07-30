const https = require('https');

const blobId = '019fb029-b1e0-782e-b56f-fc6b311cef83';

// Fetch current vehicles
https.get(`https://jsonblob.com/api/jsonBlob/${blobId}`, (res) => {
  let raw = '';
  res.on('data', c => raw += c);
  res.on('end', () => {
    try {
      let vehicles = JSON.parse(raw);
      // Update Chevrolet Tracker (ID 1)
      const tracker = vehicles.find(v => v.make.toLowerCase() === 'chevrolet' || v.id === 1);
      if (tracker) {
        tracker.make = 'Chevrolet';
        tracker.model = 'Tracker 1.0 Turbo Flex LTZ Automático';
        tracker.year = '2022/2022';
        tracker.yearNum = 2022;
        tracker.price = 98000;
        tracker.km = '66.200 km';
        tracker.kmNum = 66200;
        tracker.transmission = 'Automático';
        tracker.fuel = 'Flex';
        tracker.bodyType = 'SUV';
        tracker.color = 'Prata';
        tracker.badge = 'Destaque Original';
        tracker.badgeType = 'badge-red';
        tracker.img = 'assets/tracker_original.webp';
        tracker.status = 'available';
        tracker.optionals = [
          'Ar Condicionado Digital',
          'Direção Elétrica',
          'Central Multimídia MyLink 8"',
          'Câmera de Ré com Linhas Guia',
          'Sensor de Estacionamento Traseiro',
          'Piloto Automático',
          'Bancos em Couro',
          'Rodas de Liga Leve 17"',
          'Controle de Tração e Estabilidade',
          '6 Airbags (Frontais, Laterais e Cortina)'
        ];
      }

      const data = JSON.stringify(vehicles);

      // Save back to Cloud DB
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

      const reqPut = https.request(options, (resPut) => {
        console.log('Update Cloud DB Status:', resPut.statusCode);
      });

      reqPut.write(data);
      reqPut.end();

    } catch (e) {
      console.error(e);
    }
  });
});
