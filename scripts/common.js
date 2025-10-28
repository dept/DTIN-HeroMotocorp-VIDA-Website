const apiProxy = {};
export default async function fetchAPI(method, url, payload) {
  const key = url + method;
  if (apiProxy[key]) return apiProxy[key];
  let options = {};
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
    return err;
  }
}

// eslint-disable-next-line prefer-const
const priceMaster = await fetchAPI('GET', 'https://www.vidaworld.com/content/dam/vida/config/price-master.json.gzip');
// eslint-disable-next-line prefer-const, no-unused-vars
let cityMaster = await fetchAPI('GET', 'https://www.vidaworld.com/content/dam/vida/config/city-master.json.gzip');

let v2Lite = {}; let v2Pro = {}; let v2Plus = {};

try {
  const v2LiteAllPrices = priceMaster.filter((price) => price.item_name === 'V2 LITE');
  v2Lite = v2LiteAllPrices.filter((v2LitePrice) => v2LitePrice.variant_sf_id === 'a24OX000000WslFYAS');
  const v2ProAllPrices = priceMaster.filter((price) => price.item_name === 'V2 PRO');
  v2Pro = v2ProAllPrices.filter((v2ProPrice) => v2ProPrice.variant_sf_id === 'a24OX000000WsenYAC');
  const v2PlusAllPrices = priceMaster.filter((price) => price.item_name === 'V2 PLUS');
  v2Plus = v2PlusAllPrices.filter((v2LitePrice) => v2LitePrice.variant_sf_id === 'a24OX000000Wsi1YAC');

  v2Lite.sort((a, b) => {
    const cityA = a.city_state_id.split('~')[0].toUpperCase();
    const cityB = b.city_state_id.split('~')[0].toUpperCase();
    return cityA.localeCompare(cityB);
  });

  v2Pro.sort((a, b) => {
    const cityA = a.city_state_id.split('~')[0].toUpperCase();
    const cityB = b.city_state_id.split('~')[0].toUpperCase();
    return cityA.localeCompare(cityB);
  });

  v2Lite.sort((a, b) => {
    const cityA = a.city_state_id.split('~')[0].toUpperCase();
    const cityB = b.city_state_id.split('~')[0].toUpperCase();
    return cityA.localeCompare(cityB);
  });
} catch (error) {
  // Handle error
}
export const priceData = {
  v2Lite,
  v2Pro,
  v2Plus,
};
