// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

export default async function decorate(block) {
  block.classList.add('tab-style');
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tab-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tab and tabpanels
  const tab = [...block.children].map((child) => child.firstElementChild);
  tab.forEach((tabs, i) => {
    const id = toClassName(tabs.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tab-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', true);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tab-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tabs.innerHTML;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', false);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');

    // click event to toggle tab
    button.addEventListener('click', () => {
      const isActive = button.classList.contains('btn-active');
      const body = document.querySelector('body');
      if (!isActive) {
        button.classList.remove('btn-active');
        button.setAttribute('aria-selected', 'false');
        tabpanel.setAttribute('aria-hidden', 'true');
        button.querySelectorAll('p')[0].style.display = 'block';
        button.querySelectorAll('p')[1].style.display = 'none';

        button.classList.add('btn-active');
        button.setAttribute('aria-selected', 'true');
        tabpanel.setAttribute('aria-hidden', 'false');
        button.querySelectorAll('p')[0].style.display = 'none';
        button.querySelectorAll('p')[1].style.display = 'block';
        body.style.overflow = 'hidden';
      } else {
        button.classList.remove('btn-active');
        button.setAttribute('aria-selected', 'false');
        tabpanel.setAttribute('aria-hidden', 'true');
        button.querySelectorAll('p')[0].style.display = 'block';
        button.querySelectorAll('p')[1].style.display = 'none';
        body.style.overflow = 'auto';
      }
    });

    tablist.append(button);
    tabs.remove();
  });

  block.prepend(tablist);
}
