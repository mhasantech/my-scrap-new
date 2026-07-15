const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = async (req, res) => {
    const { code } = req.query;
    const tradingCode = code ? code.toUpperCase() : 'GP';

    try {
        // DSE-র displayCompany.php পেজে রিকোয়েস্ট
        const { data } = await axios.get(`https://www.dsebd.org/displayCompany.php?name=${tradingCode}`, {
            timeout: 15000,
            httpsAgent: agent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            }
        });

        const $ = cheerio.load(data);
        let ltp = 'N/A', high = 'N/A', low = 'N/A';

        // পেজ থেকে ডেটা পার্স করা
        $('table tr').each((i, row) => {
            const tds = $(row).find('td');
            if (tds.length >= 2) {
                const label = $(tds[0]).text().trim().toLowerCase();
                const value = $(tds[1]).text().trim();
                
                if (label.includes('last trade')) {
                    ltp = value || 'N/A';
                } else if (label.includes('day\'s high')) {
                    high = value || 'N/A';
                } else if (label.includes('day\'s low')) {
                    low = value || 'N/A';
                }
            }
        });

        res.status(200).json({ success: true, data: { tradingCode, ltp, high, low } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
