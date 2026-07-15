const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = async (req, res) => {
    const { code } = req.query;
    const tradingCode = code ? code.toUpperCase() : 'GP';

    try {
        const { data } = await axios.get('https://www.cse.com.bd/market/current_price', {
            httpsAgent: agent,
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            }
        });

        const $ = cheerio.load(data);
        let result = { tradingCode, ltp: 'N/A', high: 'N/A', low: 'N/A' };

        $('tr').each((i, row) => {
            const tds = $(row).find('td');
            if (tds.length >= 5) {
                const codeFromTable = $(tds[0]).text().trim();
                if (codeFromTable.toUpperCase() === tradingCode) {
                    result = {
                        tradingCode,
                        ltp: $(tds[1]).text().trim() || 'N/A',
                        high: $(tds[3]).text().trim() || 'N/A',
                        low: $(tds[4]).text().trim() || 'N/A',
                    };
                    return false;
                }
            }
        });

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
