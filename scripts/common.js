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
    console.error(err);
    return err;
  }
}

// eslint-disable-next-line prefer-const
const PriceMaster = await fetchAPI('GET', 'https://www.vidaworld.com/content/dam/vida/config/price-master.json.gzip');
// eslint-disable-next-line prefer-const
let cityMaster = await fetchAPI('GET', 'https://www.vidaworld.com/content/dam/vida/config/city-master.json.gzip');
console.log(PriceMaster);
console.log(cityMaster);

const v2LiteAllPrices = PriceMaster.filter((price) => price.item_name === 'V2 LITE');
const v2Lite = v2LiteAllPrices.filter((v2LitePrice) => v2LitePrice.variant_sf_id === 'a24OX000000WslFYAS');
const v2ProAllPrices = PriceMaster.filter((price) => price.item_name === 'V2 PRO');
const v2Pro = v2ProAllPrices.filter((v2ProPrice) => v2ProPrice.variant_sf_id === 'a24OX000000WsenYAC');
const v2PlusAllPrices = PriceMaster.filter((price) => price.item_name === 'V2 PLUS');
const v2Plus = v2PlusAllPrices.filter((v2LitePrice) => v2LitePrice.variant_sf_id === 'a24OX000000Wsi1YAC');
console.log('V2 LITE data ', v2Lite);
console.log('V2 PRO data ', v2Pro);
console.log('V2 PLUS data ', v2Plus);

export const priceData = {
  v2Lite,
  v2Pro,
  v2Plus,
};
