const fs = require('fs');
const https = require('https');

https.get('https://en.wikipedia.org/wiki/Emblem_of_Tamil_Nadu', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const match = data.match(/src="(\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/[^"]+TamilNadu_Logo\.svg\/[^"]+png)"/);
        if (match) {
            console.log('Found URL:', match[1]);
            const url = 'https:' + match[1].replace(/&amp;/g, '&');
            https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
                const file = fs.createWriteStream('tn_logo.png');
                res2.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log('Downloaded tn_logo.png successfully');
                });
            }).on('error', err => console.error(err));
        } else {
            console.log('Not found in HTML');
        }
    });
});
