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

const dropdown = priceData.v2Pro
  .map((city) => `<div class="city-option" value=${city.city_state_id.split('~')[0]}>${city.city_state_id.split('~')[0]}</div>`).join('');

console.log(dropdown);

//   function makeCityDropDown(){

//   }

// makeCityDropDown(priceData.v2Pro);

function getLiElements(el) {
  const ul = el.querySelector('ul');
  return ul?.children;
}
export default function decorateTable(block) {
  const table = document.createElement('table');
  const div = document.createElement('div');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const header = !block.classList.contains('no-header');
  if (header) table.append(thead);
  table.append(tbody);

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

  if (window.innerWidth <= 768) {
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
