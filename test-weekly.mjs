
const API_BASE = 'https://repository.dubtown-server.us';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const weekStart = '2025-12-28';

async function run() {
    try {
        console.log(`Fetching ${API_BASE}/sacred-journey/weekly/${weekStart}`);
        const res = await fetch(`${API_BASE}/sacred-journey/weekly/${weekStart}`);

        if (res.status === 200) {
            const data = await res.json();
            console.log("Status: 200 OK");
            console.log("Keys:", Object.keys(data));
            if (data.planetary_cards) console.log("Has Planetary Cards: Yes");
            if (data.domain_cards) console.log("Has Domain Cards: Yes");
        } else {
            console.log(`Status: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.log("Response:", text);
        }
    } catch (e) {
        console.error(e);
    }
}
run();
