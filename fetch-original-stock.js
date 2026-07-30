const https = require('https');

https.get('https://www.alemaozinhoveiculos.com.br', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('HTML Length:', html.length);
    // Find car text snippets
    const matches = html.match(/(CHEVROLET|TOYOTA|FIAT|VOLKSWAGEN|JEEP|HONDA|FORD|RENAULT|HYUNDAI)[^<]*/gi);
    if (matches) {
      console.log('Found Vehicles/Makes:', [...new Set(matches)].slice(0, 20));
    }
    
    // Find image URLs of vehicles
    const imgMatches = html.match(/https?:\/\/[^"'\s]+\.(jpg|jpeg|png|webp)/gi);
    if (imgMatches) {
      console.log('Images:', imgMatches.filter(u => u.includes('anuncio') || u.includes('garaje')).slice(0, 10));
    }
  });
});
