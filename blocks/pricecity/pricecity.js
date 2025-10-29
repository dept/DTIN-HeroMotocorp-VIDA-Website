/* eslint-disable quotes */
/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */
import { priceData } from '../../scripts/common.js';

function buildCell(rowIndex) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');
  return cell;
}

function getLiElements(el) {
  const ul = el.querySelector('ul');
  return ul?.children;
}

let selectedCity = 'DELHI';

// eslint-disable-next-line no-shadow
function getSelectedCityPrice(priceData, selectedCity, block) {
  const v2PluscityData = priceData?.v2Plus.find((city) => city.city_state_id.split('~')[0] === selectedCity);
  const v2ProcityData = priceData?.v2Pro.find((city) => city.city_state_id.split('~')[0] === selectedCity);
  const v2LitecityData = priceData?.v2Lite.find((city) => city.city_state_id.split('~')[0] === selectedCity);
  if (block.classList.contains('v2-plus')) return [v2PluscityData];
  return [v2ProcityData, v2PluscityData, v2LitecityData];
}

function listDom() {
  const dropdown = priceData?.v2Pro
    .map((city) => {
      const cityName = city.city_state_id.split('~')[0];
      const isActive = cityName === selectedCity;
      return `<div class="city-option" ${isActive ? ' active' : ''} value="${cityName}">${cityName}</div>`;
    })
    .join('');
  const cityWrapp = document.createElement('div');
  cityWrapp.classList.add('city-wrapper');
  cityWrapp.innerHTML = dropdown;
  const activeCity = cityWrapp.querySelector('.city-option[active]');
  return { cityWrapp, activeCity, dropdown };
}

// eslint-disable-next-line no-shadow
function makeCityDropDown(priceData, block) {
  const { cityWrapp, activeCity } = listDom();
  const selectWrapp = document.createElement('div');
  selectWrapp.classList.add('select-wrapper');
  const prices = getSelectedCityPrice(priceData, selectedCity, block);
  const selectCity = activeCity ? activeCity.textContent : 'Select City';
  selectWrapp.innerHTML = `
    <span class='selected-city'>
    ${selectCity}
    </span>
      ${cityWrapp.outerHTML}
  `;
  return { selectWrapp, prices };
}

function updateCityPrice(trLastChild, block, isV2Plus) {
  const prices = getSelectedCityPrice(priceData, selectedCity, block);

  const selectedCitySpan = trLastChild.querySelector('.selected-city');
  if (selectedCitySpan) {
    selectedCitySpan.textContent = selectedCity;
  }
  if (isV2Plus) {
    const price = trLastChild.querySelector('.price span');
    price.innerHTML = prices[0].effectivePrice;
  } else {
    trLastChild.querySelectorAll(':scope div td').forEach((td, index) => {
      const price = prices[index]?.effectivePrice;
      if (price) {
        let priceSpan = td.querySelector('.price-value');
        if (!priceSpan) {
          priceSpan = document.createElement('span');
          priceSpan.classList.add('price-value');
          td.appendChild(priceSpan);
        }
        priceSpan.textContent = price;
      }
    });
  }

  trLastChild.querySelectorAll('.city-wrapper .city-option').forEach((cityOption) => {
    if (cityOption.textContent === selectedCity) {
      cityOption.classList.add('active');
    } else {
      cityOption.classList.remove('active');
    }
  });
}

function setupCityDropdownAndPrice(trLastChild, block, isV2Plus) {
  const { selectWrapp } = makeCityDropDown(priceData, block);
  const cityTd = isV2Plus ? trLastChild.querySelector('.main-heading .state-city') : trLastChild.querySelector('td');
  cityTd.innerHTML = '';
  cityTd.appendChild(selectWrapp);
  updateCityPrice(trLastChild, block, isV2Plus);
  const cities = block.querySelectorAll('.city-wrapper .city-option');
  cities.forEach((city) => {
    city.addEventListener('click', (e) => {
      e.stopPropagation();
      const newCity = e.target.textContent;
      if (newCity !== selectedCity) {
        selectedCity = newCity;
        updateCityPrice(trLastChild, block, isV2Plus);
      }
      cityTd.classList.remove('open');
    });
  });
  cityTd.addEventListener('click', (e) => {
    e.currentTarget.classList.toggle('open');
  });
}

export default function decorateTable(block) {
  if (block.classList.contains('v2-plus')) {
    block.innerHTML = `
    <div class="price-container">
    <div class="left-content">
        <div class="main-heading"><span>${block.querySelector('h2').textContent.trim()}</span>
         <div class='state-city'>Select city</div>
        </div>
        <p class="sub-text">${block.querySelector("p").textContent.trim()}</p>
    </div>
    <div class="right-content">
        <div class="price">₹ <span></span></div>
        <p class="disclaimer">${block.querySelector("ul li").textContent.trim()}</p>
    </div>
</div>`;
  } else {
    const table = document.createElement('table');
    const div = document.createElement('div');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const header = !block.classList.contains('no-header');
    if (header) table.append(thead);
    table.append(tbody);

    // --- Original Table Construction Logic ---
    [...getLiElements(block)].forEach((child, i) => {
      const row = document.createElement('tr');
      if (i) tbody.append(row); else thead.append(row);
      [...getLiElements(child)].forEach((col) => {
        const cell = buildCell(header ? i : i + 1);
        if (col.innerHTML.includes('img') && col.textContent.trim()) {
          col.remove();
          const p = document.createElement('p');
          const span = document.createElement('span');
          span.append(col.textContent.trim());
          p.append(col.querySelector('img'));
          p.append(span);
          cell.append(p);
        } else if (col.innerHTML.includes('img')) {
          col.remove();
          cell.append(col.querySelector('img'));
        } else {
          cell.innerHTML = col.innerHTML;
        }
        row.append(cell);
      });
    });
    block.innerHTML = '';
    div.append(table);
    block.append(div);

    block.querySelectorAll('tbody tr').forEach((tr) => {
      const tds = tr.querySelectorAll('td');
      if (tds.length > 1) {
        const wrapper = document.createElement('div');

        // Move all <td>s except the first one inside the wrapper
        // eslint-disable-next-line no-plusplus
        for (let i = 1; i < tds.length; i++) {
          wrapper.appendChild(tds[i]);
        }

        // Append the wrapper back into the <tr> after the first td
        tr.appendChild(wrapper);
      }
    });

    if (window.innerWidth <= 900) {
      block.querySelectorAll('th').forEach((th) => {
        if (th.textContent.trim() === '') {
          th.remove();
        }
      });
    }

    document.querySelectorAll('td').forEach((td) => {
      const p = td.querySelector('p');

      if (p) {
        // NEW: check if <p>'s text equals "colors" (case-insensitive)
        const pText = p.textContent.trim().toLowerCase();
        if (pText === 'colors') {
          // Find sibling <div> inside the same <tr>
          const siblingDiv = td.parentElement.querySelector('div');

          if (siblingDiv) {
            // Add 'color' class to all <td> inside that sibling div
            siblingDiv.querySelectorAll('td').forEach((innerTd) => {
              innerTd.classList.add('color');
            });

            // For each <li> inside <ul> inside those tds: use li text as background color
            siblingDiv.querySelectorAll('td ul li').forEach((li) => {
              const colorCode = li.textContent.trim();

              // Validate color formats (#hex, rgb(...), rgba(...), hsl(...), hsla(...))
              const isColor = /^#([0-9A-F]{3}){1,2}$/i.test(colorCode) // #RGB / #RRGGBB
                || /^rgb\((\s*\d+\s*,){2}\s*\d+\s*\)$/.test(colorCode) // rgb(...)
                || /^rgba\((\s*\d+\s*,){3}\s*(0|1|0?\.\d+)\s*\)$/.test(colorCode) // rgba(...)
                || /^hsl\(\s*\d+\s*,\s*\d+%?,\s*\d+%?\)$/.test(colorCode) // hsl(...)
                || /^hsla\(\s*\d+\s*,\s*\d+%?,\s*\d+%?,\s*(0|1|0?\.\d+)\s*\)$/.test(colorCode); // hsla(...)

              if (isColor) {
                li.style.backgroundColor = colorCode;
                li.textContent = '';
              }
            });
          }
        }
      }
    });
  }

  const trLastChild = block.querySelector('table tbody tr:last-child');
  const isV2Plus = block.classList.contains('v2-plus');
  if (isV2Plus) {
    const priceDetail = block.querySelector(".price-container");
    debugger;
    setupCityDropdownAndPrice(priceDetail, block, isV2Plus);
  }
  if (trLastChild) {
    setupCityDropdownAndPrice(trLastChild, block);
  }
}
