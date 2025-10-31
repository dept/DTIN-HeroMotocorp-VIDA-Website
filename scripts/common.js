/* eslint-disable no-shadow */
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
export const cityMaster = await fetchAPI('GET', 'https://www.vidaworld.com/content/dam/vida/config/city-master.json.gzip');

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

let selectedCity = 'DELHI';

function getSelectedCityPrice(priceData, selectedCity, block) {
  const findCity = (arr) => arr?.find((c) => c.city_state_id.split('~')[0] === selectedCity);
  const v2Plus = findCity(priceData?.v2Plus || []);
  const v2Pro = findCity(priceData?.v2Pro || []);
  const v2Lite = findCity(priceData?.v2Lite || []);
  return block.classList.contains('v2-plus')
    ? [v2Plus]
    : [v2Pro, v2Plus, v2Lite];
}

function buildCityList(priceData) {
  const wrapper = document.createElement('div');
  wrapper.className = 'city-wrapper';
  wrapper.innerHTML = (priceData?.v2Pro || [])
    .map((city) => {
      const name = city.city_state_id.split('~')[0];
      const active = name === selectedCity ? ' active' : '';
      return `<div class="city-option${active}" data-value="${name}">${name}</div>`;
    })
    .join('');
  return wrapper;
}

function createCityDropdown(priceData) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('select-wrapper');
  const cityList = buildCityList(priceData);
  const selectCity = selectedCity || 'Select City';

  wrapper.innerHTML = `
    <span class="selected-city">${selectCity}</span>
    <div class="select-dropdown">
      <img class="search-close" src="/icons/close.png" alt="close">
      <div class="search-bar">
        <input type="text" placeholder="Search" class="search-input"/>
        <button class="search-btn">
          <img src="/icons/search.svg" alt="Search"/>
        </button>
      </div>
      ${cityList.outerHTML}
    </div>
  `;

  const closeBtn = wrapper.querySelector('.search-close');
  const input = wrapper.querySelector('.search-input');
  // const optionsContainer = wrapper.querySelector('.city-wrapper');
  const options = wrapper.querySelectorAll('.city-option');

  // 🔹 Close button logic
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    wrapper.classList.remove('open');
    if (window.innerWidth <= 900) document.body.classList.remove('dropdown-open');
  });

  // 🔹 Working search logic
  input.addEventListener('keyup', (e) => {
    const filter = e.target.value.trim().toLowerCase();
    options.forEach((opt) => {
      const text = opt.textContent.trim().toLowerCase();
      // Show/hide based on search term
      opt.style.display = text.includes(filter) ? 'block' : 'none';
    });
  });

  return wrapper;
}

function closeDropdown() {
  document.querySelectorAll('.select-wrapper.open, .state-city.open, table tr:last-child td.open')
    .forEach((el) => el.classList.remove('open'));
  if (window.innerWidth <= 900) document.body.classList.remove('dropdown-open');
}

function updatePrices(priceElements, block, priceData, customUpdater) {
  const prices = getSelectedCityPrice(priceData, selectedCity, block);

  if (typeof customUpdater === 'function') {
    customUpdater(prices, selectedCity, priceElements);
    return;
  }

  const priceNodes = priceElements instanceof NodeList || Array.isArray(priceElements)
    ? Array.from(priceElements)
    : [priceElements];

  priceNodes.forEach((td, index) => {
    const price = prices[index]?.effectivePrice;
    if (price) {
      let span = td.querySelector('.price-value');
      if (!span) {
        span = document.createElement('span');
        span.classList.add('price-value');
        td.appendChild(span);
      }
      span.textContent = price;
    }
  });
}

function setupCityDropdownAndPrice(targetRow, priceElements, block, priceData, customUpdater) {
  const dropdown = createCityDropdown(priceData);
  const cityContainer = targetRow.querySelector('.state-city')
    || targetRow.querySelector('td')
    || targetRow;

  cityContainer.innerHTML = '';
  cityContainer.appendChild(dropdown);

  const selectedCityEl = dropdown.querySelector('.selected-city');
  const cityOptions = dropdown.querySelectorAll('.city-option');

  // Initial price update
  updatePrices(priceElements, block, priceData, customUpdater);

  cityOptions.forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const newCity = e.target.dataset.value;

      if (newCity !== selectedCity) {
        selectedCity = newCity;

        // 🔹 Update visible selected city name
        selectedCityEl.textContent = selectedCity;

        // 🔹 Update active state in dropdown
        cityOptions.forEach((o) => o.classList.toggle('active', o.dataset.value === selectedCity));

        // 🔹 Update all price values
        updatePrices(priceElements, block, priceData, customUpdater);
      }

      // Close dropdown
      dropdown.classList.remove('open');
      if (window.innerWidth <= 900) document.body.classList.remove('dropdown-open');
    });
  });

  cityContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    closeDropdown(); // close any other open dropdowns
    dropdown.classList.add('open');
    if (window.innerWidth <= 900) document.body.classList.add('dropdown-open');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !cityContainer.contains(e.target)) {
      dropdown.classList.remove('open');
      if (window.innerWidth <= 900) document.body.classList.remove('dropdown-open');
    }
  });
}

export {
  setupCityDropdownAndPrice,
  updatePrices,
  closeDropdown,
  getSelectedCityPrice,
  createCityDropdown,
  buildCityList,
};

function buildCityMasterList(cityData) {
  const wrapper = document.createElement('div');
  wrapper.className = 'city-wrapper';

  wrapper.innerHTML = cityData
    .map((city) => {
      const { cityName } = city;
      const citySlug = cityName.toLowerCase().replace(/\s+/g, '-');
      return `
        <a href="/dealers/${citySlug}.html" 
           class="city-option" 
           data-value="${cityName.toUpperCase()}">
          ${cityName.toUpperCase()}
        </a>
      `;
    })
    .join('');

  return wrapper;
}

export function createCityMasterDropdown(cityData) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('select-wrapper'); // always open by default

  const cityList = buildCityMasterList(cityData);

  wrapper.innerHTML = `
      <div class="search-bar">
        <input type="text" placeholder="Search for your city" class="search-input"/>
        <button class="search-btn">
          <img src="/icons/Search.svg" alt="Search"/>
        </button>
      </div>
      ${cityList.outerHTML}
  `;

  const input = wrapper.querySelector('.search-input');
  const options = wrapper.querySelectorAll('.city-option');

  // 🔹 Live search filter
  input.addEventListener('keyup', (e) => {
    const filter = e.target.value.trim().toUpperCase();
    options.forEach((opt) => {
      const cityName = opt.getAttribute('data-value');
      opt.style.display = cityName.includes(filter) ? 'flex' : 'none';
    });
  });

  input.addEventListener('click', () => {
    wrapper.classList.add('open');
  });

  // 🔹 When user clicks a city
  options.forEach((opt) => {
    opt.addEventListener('click', () => {
      document.body.classList.remove('dropdown-open');
      wrapper.classList.remove('open');
    });
  });

  // 🔹 Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      wrapper.classList.remove('open');
      document.body.classList.remove('dropdown-open');
    }
  });

  return wrapper;
}
