import { getMetadata } from '../../scripts/aem.js';
import { isMobile, loadFragment } from '../../scripts/scripts.js';

// media query match that indicates mobile/tablet width
export const isDesktop = window.matchMedia('(min-width: 900px)');
const nullDom = document.createElement('div');

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  // const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  // button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const mobNavMeta = getMetadata('mob-nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const mobNavPath = mobNavMeta ? new URL(mobNavMeta, window.location).pathname : '/mob-nav';
  let fragment;
  if (isMobile.matches) {
    fragment = await loadFragment(mobNavPath);
  } else {
    fragment = await loadFragment(navPath);
  }

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // const navBrand = nav.querySelector('.nav-brand');
  // const brandLink = navBrand.querySelector('.button');
  // if (brandLink) {
  //   brandLink.className = '';
  //   // brandLink.closest('.button-container').className = '';
  // }
  const navSections = nav.querySelector('.nav-sections') || nullDom;
  // const navContent = nav.querySelector('.nav-sections .default-content-wrapper') || nullDom;

  // navSections.innerHTML = `
  // <div class="navsection-wrapper">
  // <div class="navcontent-wrapper">
  //   ${navContent?.outerHTML}
  // </div>
  // </div>
  // `

  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  // const hamburger = document.createElement('div');
  // hamburger.classList.add('nav-hamburger');
  // hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
  //     <span class="nav-hamburger-icon"></span>
  //   </button>`;

  // let isExpanded = false;
  // hamburger.addEventListener('click', () => {
  //   toggleMenu(nav, navSections);

  //   // isExpanded = !isExpanded;
  //   document.body.style.overflowY = "hidden";
  // });
  // nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const closeIcon = navSections.querySelector('.icon-close_icon img');
  const isMobileWidth = window.innerWidth < 900;
  closeIcon?.addEventListener('click', () => {
    nav.setAttribute('aria-expanded', `${!isMobileWidth}`);
    document.body.style.overflowY = '';
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
  const head = document.querySelector('.head-accordion');

  if (head) {
    const accordionItems = head.querySelectorAll('.accordion-item');

    accordionItems.forEach((item) => {
      const label = item.querySelector('.accordion-item-label');
      const body = item.querySelector('.accordion-item-body');
      // const details = item.closest('details');

      let isHovering = false;

      function openAccordion() {
        item.classList.add('active');
      }

      function closeAccordion() {
        item.classList.remove('active');
      }

      function onEnter() {
        isHovering = true;
      }

      function onLeave() {
        isHovering = false;
        setTimeout(() => {
          if (!isHovering) closeAccordion();
        }, 300);
      }

      label.addEventListener('mouseenter', () => {
        openAccordion();
        onEnter();
      });

      label.addEventListener('mouseleave', onLeave);
      body.addEventListener('mouseenter', onEnter);
      body.addEventListener('mouseleave', onLeave);
    });
  }
  const panel = document.querySelector('.tab-panel');
  if (isMobile.matches) {
    panel.querySelectorAll('.accordion-item').forEach((index) => {
      index.addEventListener('click', () => {
        index.classList.toggle('active');
      });
    });
  }
}
