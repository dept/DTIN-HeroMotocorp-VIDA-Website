const apiProxy = {};

export default async function fetchAPI(method, url, payload) {
    const key = url + method;
    if (apiProxy[key]) return apiProxy[key];
    const options = {};
    if (method !== 'GET') {
        options = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        options.body = JSON.stringify(payload);
    }

    try {
        const resp = await fetch(url, options);
        if (!resp.ok) throw new Error('Network error');

        const data = await resp.json();
        apiProxy[key] = data;
        return data;
    } catch (err) {
        console.error(err);
        return err;
    }
}

let PriceMaster = await fetchAPI('GET', 'https://www.vidaworld.com/content/dam/vida/config/price-master.json.gzip');
let cityMaster = await fetchAPI('GET', 'https://www.vidaworld.com/content/dam/vida/config/city-master.json.gzip');
console.log(PriceMaster);
console.log(cityMaster);
