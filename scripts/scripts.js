import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  toClassName,
} from './aem.js';

const experimentationIndex = '../plugins/experimentation/src/index.js';
const experimentationConfig = {
  prodHost: 'www.my-site.com',
  audiences: {
    mobile: () => window.innerWidth < 600,
    desktop: () => window.innerWidth >= 600,
    // define your custom audiences here as needed
  },
};

let runExperimentation;
let showExperimentationOverlay;
const isExperimentationEnabled = document.head.querySelector('[name^="experiment"],[name^="campaign-"],[name^="audience-"],[property^="campaign:"],[property^="audience:"]')
  || [...document.querySelectorAll('.section-metadata div')].some((d) => d.textContent.match(/Experiment|Campaign|Audience/i));
if (isExperimentationEnabled) {
  ({
    loadEager: runExperimentation,
    loadLazy: showExperimentationOverlay,
  } = await import(experimentationIndex));
}
/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */

export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}
/**
 * Creates an element with the given tag name and properties.
 * @param {string} tagName The tag name of the element to create.
 * @param {object} props The properties to set on the element.
 * @param {string|Element|Array} html The HTML content to append to the element.
 * @returns {HTMLElement} The created element.
 */
export function createElement(tagName, props, html) {
  const elem = document.createElement(tagName);
  if (props) {
    Object.keys(props).forEach((propName) => {
      const val = props[propName];
      if (propName === 'class') {
        const classesArr = (typeof val === 'string') ? [val] : val;
        elem.classList.add(...classesArr);
      } else {
        elem.setAttribute(propName, val);
      }
    });
  }

  if (html) {
    const appendEl = (el) => {
      if (el instanceof HTMLElement || el instanceof SVGElement) {
        elem.append(el);
      } else {
        elem.insertAdjacentHTML('beforeend', el);
      }
    };

    if (Array.isArray(html)) {
      html.forEach(appendEl);
    } else {
      appendEl(html);
    }
  }

  return elem;
}
/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/*
 * Embed Block
 * Show videos and social posts directly on your page
 * https://www.hlx.live/developer/block-collection/embed
 */

const loadScript = (url, callback, type) => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (type) {
    script.setAttribute('type', type);
  }
  script.onload = callback;
  head.append(script);
  return script;
};

const getDefaultEmbed = (url) => {
  const embedHTML = `<iframe src="${url.href}" 
    style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
    allowfullscreen="" scrolling="no" allow="encrypted-media" 
    title="Content from ${url.hostname}" loading="lazy">
  </iframe>`;
  return embedHTML;
};

const embedYoutube = (url, autoplay) => {
  const usp = new URLSearchParams(url.search);
  const suffix = autoplay ? '&muted=1&autoplay=1' : '';
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }
  // The wrapper div has been removed. Styles are added directly to the iframe.
  const embedHTML = `<iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" 
    style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute; object-fit: cover;" 
    allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" 
    allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>`;
  return embedHTML;
};

const embedVimeo = (url, autoplay) => {
  const [, video] = url.pathname.split('/');
  const suffix = autoplay ? '?muted=1&autoplay=1' : '';
  // Returns only the iframe, styled to fill its container
  const embedHTML = `<iframe src="https://player.vimeo.com/video/${video}${suffix}" 
    style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
    frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen
    title="Content from Vimeo" loading="lazy"></iframe>`;
  return embedHTML;
};

const embedTwitter = (url) => {
  const embedHTML = `<blockquote class="twitter-tweet"><a href="${url.href}"></a></blockquote>`;
  loadScript('https://platform.twitter.com/widgets.js');
  return embedHTML;
};

const embedInstagram = (url) => {
  const embedHTML = `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${url.href}" data-instgrm-version="14"></blockquote>`;
  loadScript('https://www.instagram.com/embed.js', () => {
    if (window.instgrm && window.instgrm.Embeds) {
      window.instgrm.Embeds.process();
    }
  });
  return embedHTML;
};

export const isMobile = window.matchMedia('(max-width: 900px)');

const loadEmbed = (block, link, autoplay) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  const EMBEDS_CONFIG = [
    {
      match: ['youtube', 'youtu.be'],
      embed: embedYoutube,
    },
    {
      match: ['vimeo'],
      embed: embedVimeo,
    },
    {
      match: ['twitter'],
      embed: embedTwitter,
    },
    {
      match: ['instagram'],
      embed: embedInstagram,
    },
  ];

  const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
  const url = new URL(link);
  if (config) {
    block.innerHTML = config.embed(url, autoplay);
    block.classList = `block embed embed-${config.match[0]}`;
  } else {
    block.innerHTML = getDefaultEmbed(url);
    block.classList = 'block embed';
  }
  block.classList.add('embed-is-loaded');
};

/**
 * Checks if an element is visible in the initial viewport.
 * @param {Element} el The element to check.
 * @returns {boolean} True if the element is above the fold.
 */
function isAboveTheFold(el) {
  const rect = el.getBoundingClientRect();
  return rect.top >= 0 && rect.top <= window.innerHeight;
}

export default function decorateEmbed(block) {
  const placeholder = block.querySelector('picture') || block.previousElementSibling?.querySelector('picture');
  const link = block.querySelector('a').href;
  block.textContent = '';

  // --- CLS FIX ---
  // Apply styles directly to the block to reserve its space.
  // This prevents the layout from shifting when the embed loads.
  block.style.position = 'relative';
  block.style.width = '100%';
  block.style.height = '0';
  block.style.paddingBottom = '56.25%'; // 16:9 aspect ratio

  // --- LCP FIX ---
  // Decide how to load the embed based on its position on the page.
  if (isAboveTheFold(block)) {
    // Eager load: The block is visible on page load, so load the embed immediately.
    loadEmbed(block, link, false);
  } else if (placeholder) {
    // Click-to-load: The block is below the fold and has a placeholder image.
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-placeholder'; // You may need to style this class
    wrapper.innerHTML = '<div class="embed-placeholder-play"><button type="button" title="Play"></button></div>';
    wrapper.style.position = 'absolute';
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.cursor = 'pointer';
    wrapper.prepend(placeholder);
    wrapper.addEventListener('click', () => {
      loadEmbed(block, link, true);
    });
    block.append(wrapper);
  } else {
    // Lazy-load: The block is below the fold with no placeholder, use IntersectionObserver.
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(block, link);
      }
    });
    observer.observe(block);
  }
}

function autolinkModals(element) {
  element.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');

    if (origin && origin.href && origin.href.includes('/modals/')) {
      e.preventDefault();
      const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
      openModal(origin.href);
    }
  });
}

function createFieldWrapper(fd) {
  const fieldWrapper = document.createElement('div');
  if (fd.Style) fieldWrapper.className = fd.Style;
  fieldWrapper.classList.add('field-wrapper', `${fd.Type}-wrapper`);

  fieldWrapper.dataset.fieldset = fd.Fieldset;

  return fieldWrapper;
}

const ids = [];
function generateFieldId(fd, suffix = '') {
  const slug = toClassName(`form-${fd.Name}${suffix}`);
  ids[slug] = ids[slug] || 0;
  const idSuffix = ids[slug] ? `-${ids[slug]}` : '';
  ids[slug] += 1;
  return `${slug}${idSuffix}`;
}

function createLabel(fd) {
  const label = document.createElement('label');
  label.id = generateFieldId(fd, '-label');
  label.textContent = fd.Label || fd.Name;
  label.setAttribute('for', fd.Id);
  if (fd.Mandatory.toLowerCase() === 'true' || fd.Mandatory.toLowerCase() === 'x') {
    label.dataset.required = true;
  }
  return label;
}

function setCommonAttributes(field, fd) {
  field.id = fd.Id;
  field.name = fd.Name;
  field.required = fd.Mandatory && (fd.Mandatory.toLowerCase() === 'true' || fd.Mandatory.toLowerCase() === 'x');
  field.placeholder = fd.Placeholder;
  field.value = fd.Value;
}

const createHeading = (fd) => {
  const fieldWrapper = createFieldWrapper(fd);

  const level = fd.Style && fd.Style.includes('sub-heading') ? 3 : 2;
  const heading = document.createElement(`h${level}`);
  heading.textContent = fd.Value || fd.Label;
  heading.id = fd.Id;

  fieldWrapper.append(heading);

  return { field: heading, fieldWrapper };
};

const createPlaintext = (fd) => {
  const fieldWrapper = createFieldWrapper(fd);

  const text = document.createElement('p');
  text.textContent = fd.Value || fd.Label;
  text.id = fd.Id;

  fieldWrapper.append(text);

  return { field: text, fieldWrapper };
};

const createSelect = async (fd) => {
  const select = document.createElement('select');
  setCommonAttributes(select, fd);
  const addOption = ({ text, value }) => {
    const option = document.createElement('option');
    option.text = text.trim();
    option.value = value.trim();
    if (option.value === fd.Value) {
      option.setAttribute('selected', '');
    }
    select.add(option);
    return option;
  };

  if (fd.Placeholder) {
    const ph = addOption({ text: fd.Placeholder, value: '' });
    ph.setAttribute('disabled', '');
  }

  if (fd.Options) {
    let options = [];
    if (fd.Options.startsWith('https://')) {
      const optionsUrl = new URL(fd.Options);
      const resp = await fetch(`${optionsUrl.pathname}${optionsUrl.search}`);
      const json = await resp.json();
      json.data.forEach((opt) => {
        options.push({
          text: opt.Option,
          value: opt.Value || opt.Option,
        });
      });
    } else {
      options = fd.Options.split(',').map((opt) => ({
        text: opt.trim(),
        value: opt.trim(),
      }));
    }

    options.forEach((opt) => addOption(opt));
  }

  const fieldWrapper = createFieldWrapper(fd);
  fieldWrapper.append(select);
  fieldWrapper.prepend(createLabel(fd));

  return { field: select, fieldWrapper };
};

const createConfirmation = (fd, form) => {
  form.dataset.confirmation = new URL(fd.Value).pathname;

  return {};
};

const createSubmit = (fd) => {
  const button = document.createElement('button');
  button.textContent = fd.Label || fd.Name;
  button.classList.add('button');
  button.type = 'submit';

  const fieldWrapper = createFieldWrapper(fd);
  fieldWrapper.append(button);
  return { field: button, fieldWrapper };
};

const createTextArea = (fd) => {
  const field = document.createElement('textarea');
  setCommonAttributes(field, fd);

  const fieldWrapper = createFieldWrapper(fd);
  const label = createLabel(fd);
  field.setAttribute('aria-labelledby', label.id);
  fieldWrapper.append(field);
  fieldWrapper.prepend(label);

  return { field, fieldWrapper };
};

const createInput = (fd) => {
  const field = document.createElement('input');
  field.type = fd.Type;
  setCommonAttributes(field, fd);

  const fieldWrapper = createFieldWrapper(fd);
  const label = createLabel(fd);
  field.setAttribute('aria-labelledby', label.id);
  fieldWrapper.append(field);
  if (fd.Type === 'radio' || fd.Type === 'checkbox') {
    fieldWrapper.append(label);
  } else {
    fieldWrapper.prepend(label);
  }

  return { field, fieldWrapper };
};

const createFieldset = (fd) => {
  const field = document.createElement('fieldset');
  setCommonAttributes(field, fd);

  if (fd.Label) {
    const legend = document.createElement('legend');
    legend.textContent = fd.Label;
    field.append(legend);
  }

  const fieldWrapper = createFieldWrapper(fd);
  fieldWrapper.append(field);

  return { field, fieldWrapper };
};

const createToggle = (fd) => {
  const { field, fieldWrapper } = createInput(fd);
  field.type = 'checkbox';
  if (!field.value) field.value = 'on';
  field.classList.add('toggle');
  fieldWrapper.classList.add('selection-wrapper');

  const toggleSwitch = document.createElement('div');
  toggleSwitch.classList.add('switch');
  toggleSwitch.append(field);
  fieldWrapper.append(toggleSwitch);

  const slider = document.createElement('span');
  slider.classList.add('slider');
  toggleSwitch.append(slider);
  slider.addEventListener('click', () => {
    field.checked = !field.checked;
  });

  return { field, fieldWrapper };
};

const createCheckbox = (fd) => {
  const { field, fieldWrapper } = createInput(fd);
  if (!field.value) field.value = 'checked';
  fieldWrapper.classList.add('selection-wrapper');

  return { field, fieldWrapper };
};

const createRadio = (fd) => {
  const { field, fieldWrapper } = createInput(fd);
  if (!field.value) field.value = fd.Label || 'on';
  fieldWrapper.classList.add('selection-wrapper');

  return { field, fieldWrapper };
};

const FIELD_CREATOR_FUNCTIONS = {
  select: createSelect,
  heading: createHeading,
  plaintext: createPlaintext,
  'text-area': createTextArea,
  toggle: createToggle,
  submit: createSubmit,
  confirmation: createConfirmation,
  fieldset: createFieldset,
  checkbox: createCheckbox,
  radio: createRadio,
};

export async function createField(fd, form) {
  fd.Id = fd.Id || generateFieldId(fd);
  const type = fd.Type.toLowerCase();
  const createFieldFunc = FIELD_CREATOR_FUNCTIONS[type] || createInput;
  const fieldElements = await createFieldFunc(fd, form);

  return fieldElements.fieldWrapper;
}

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    // eslint-disable-next-line no-param-reassign
    path = path.replace(/(\.plain)?\.html/, '');
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      // reset base path for media to fragment base
      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');
      // eslint-disable-next-line
      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

export async function decorateFragment(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.classList.add(...fragmentSection.classList);
      block.classList.remove('section');
      block.replaceChildren(...fragmentSection.childNodes);
    }
  }
}

async function createForm(formHref, submitHref) {
  const { pathname } = new URL(formHref);
  const resp = await fetch(pathname);
  const json = await resp.json();

  const form = document.createElement('form');
  form.dataset.action = submitHref;

  const fields = await Promise.all(json.data.map((fd) => createField(fd, form)));
  fields.forEach((field) => {
    if (field) {
      form.append(field);
    }
  });

  // group fields into fieldsets
  const fieldsets = form.querySelectorAll('fieldset');
  fieldsets.forEach((fieldset) => {
    form.querySelectorAll(`[data-fieldset="${fieldset.name}"`).forEach((field) => {
      fieldset.append(field);
    });
  });

  return form;
}

function generatePayload(form) {
  const payload = {};

  [...form.elements].forEach((field) => {
    if (field.name && field.type !== 'submit' && !field.disabled) {
      if (field.type === 'radio') {
        if (field.checked) payload[field.name] = field.value;
      } else if (field.type === 'checkbox') {
        if (field.checked) payload[field.name] = payload[field.name] ? `${payload[field.name]},${field.value}` : field.value;
      } else {
        payload[field.name] = field.value;
      }
    }
  });
  return payload;
}

async function handleSubmit(form) {
  if (form.getAttribute('data-submitting') === 'true') return;

  const submit = form.querySelector('button[type="submit"]');
  try {
    form.setAttribute('data-submitting', 'true');
    submit.disabled = true;

    // create payload
    const payload = generatePayload(form);
    const response = await fetch(form.dataset.action, {
      method: 'POST',
      body: JSON.stringify({ data: payload }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      if (form.dataset.confirmation) {
        window.location.href = form.dataset.confirmation;
      }
    } else {
      const error = await response.text();
      throw new Error(error);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  } finally {
    form.setAttribute('data-submitting', 'false');
    submit.disabled = false;
  }
}

export async function decorateForm(block) {
  const formLink = block.querySelector('a').href;
  const submitLink = '/api';
  // if (!formLink || !submitLink) return;

  const form = await createForm(formLink, submitLink);
  block.replaceChildren(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = form.checkValidity();
    if (valid) {
      handleSubmit(form);
    } else {
      const firstInvalidEl = form.querySelector(':invalid:not(fieldset)');
      if (firstInvalidEl) {
        firstInvalidEl.focus();
        firstInvalidEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
}

function loadAutoBlock(doc) {
  doc.querySelectorAll('a').forEach((a) => {
    if (a && a.href && a.href.includes('/fragments/')) {
      decorateFragment(a.parentElement);
    } else if (a && a.href && a.href.includes('.youtube.')) {
      decorateEmbed(a.parentElement);
    } else if (a && a.href && a.href.includes('x.com')) {
      decorateEmbed(a.parentElement);
    } else if (a && a.href && a.href.includes('vimeo.com')) {
      decorateEmbed(a.parentElement);
    } else if (a && a.href && a.href.includes('/forms/')) {
      decorateForm(a.parentElement);
    } else if (a && a.href && a.href.includes('instagram.com')) {
      decorateEmbed(a.parentElement);
    }
  });
}
/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // TODO: add auto block, if needed
    loadAutoBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (runExperimentation) {
    await runExperimentation(document, experimentationConfig);
  }
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  autolinkModals(doc);
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
  loadAutoBlock(doc);
  if (showExperimentationOverlay) {
    await showExperimentationOverlay(document, experimentationConfig);
  }
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
