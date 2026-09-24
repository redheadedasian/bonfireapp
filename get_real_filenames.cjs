const https = require('https');

const fileIds = [
  '1ZTDu_R6yMdmfpL9ZpRRF8EQSJnzaaVSi',
  '1os4ZXipSwOaQtQf9vStuDXQ_FGCWTDNM',
  '1EyvBBVVNQaZC3GdIlfwWXJpAb0z_Mh_h',
  '16mgRYmSu4Iqq3AbXJy7bp42o4gjEp2R3',
  '1X4cbSKK0Vnzbr2IbyGEQ13W3CR8x4XdB',
  '1_SJ-TQ-kCYVxEJC-qsKkQJ7aXBD4JUEi',
  '1Fm8bqC4POtwh_IG7BjDXUSKEJtBFtaRx',
  '1RsrcEo_EOGh6yG_yCAOfZz3PD6hWevXK',
  '1e4Yssxht-cfdPO_RfS-6MmNwhnvUG1X9'
];

function getFileName(fileId) {
  return new Promise((resolve) => {
    https.get(`https://drive.google.com/file/d/${fileId}/view`, (res) => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
        // Check if title is already in data to finish early
        const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
          let name = titleMatch[1].replace(' - Google Drive', '').trim();
          resolve({ id: fileId, name });
        }
      });
      res.on('end', () => {
        const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
        let name = titleMatch ? titleMatch[1].replace(' - Google Drive', '').trim() : 'Unknown';
        resolve({ id: fileId, name });
      });
    }).on('error', () => resolve({ id: fileId, name: 'Error' }));
  });
}

async function run() {
  const results = await Promise.all(fileIds.map(getFileName));
  console.log('Original Google Drive File Names:');
  results.forEach(r => console.log(`- ID: ${r.id} -> Name: "${r.name}"`));
}

run();
