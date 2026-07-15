const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https'); // https মডিউল যোগ করলাম

// SSL যাচাই বন্ধ করার জন্য এজেন্ট
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = async (req, res) => {
    const { code } = req.query;
    const tradingCode = code ? code.toUpperCase() : 'GP';

    try {
        const { data } = await axios.get('https://dsebd.org/latest_share_price_scroll_l.php', {
            timeout: 15000,
            httpsAgent: agent, // এজেন্ট ব্যবহার
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            }
        });

        const $ = cheerio.load(data);
        let result = { tradingCode, ltp: 'N/A', high: 'N/A', low: 'N/A' };

        $('tr').each((i, row) => {
            const tds = $(row).find('td');
            if (tds.length >= 6) {
                const codeFromTable = $(tds[0]).text().trim();
                if (codeFromTable.toUpperCase() === tradingCode) {
                    result = {
                        tradingCode,
                        ltp: $(tds[1]).text().trim() || 'N/A',
                        high: $(tds[2]).text().trim() || 'N/A',
                        low: $(tds[3]).text().trim() || 'N/A',
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
