
const API_BASE = 'https://neo4jmiddleware.robin-alligator.ts.net';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function run() {
    try {
        const res = await fetch(`${API_BASE}/sacred-journey/history?limit=1&include_entries=true`);
        const data = await res.json();
        if (data.readings && data.readings.length > 0) {
            console.log("Reading Keys:", Object.keys(data.readings[0]));
            console.log("Planetary Cards:", data.readings[0].planetary_cards);
            console.log("Domain Cards:", data.readings[0].domain_cards);
        } else {
            console.log("No readings found");
        }
    } catch (e) {
        console.error(e);
    }
}
run();
