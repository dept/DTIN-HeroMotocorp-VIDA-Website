export default function decorate(block) {
  [...block.children].forEach((row) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'accordion-container';

    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);

    const body = row.children[1];
    body.className = 'accordion-item-body';

    // ✅ Check if accordion is inside .head-accordion
    const isHeadAccordion = block.closest('.head-accordion');

    // If inside .head-accordion → use <div>, else use <details>
    const details = isHeadAccordion
      ? document.createElement('div')
      : document.createElement('details');

    details.className = 'accordion-item';
    details.append(summary, body);

    wrapper.append(details);
    row.replaceWith(wrapper);
  });

  // View more / View less functionality
  const dcw = document.querySelectorAll('.faq .default-content-wrapper')[1];
  const viewMore = dcw.querySelectorAll('p:nth-child(1)')[0];
  const viewLess = dcw.querySelectorAll('p:nth-child(2)')[0];
  const height = document.querySelectorAll('.faq .accordion')[0];

  viewMore.addEventListener('click', () => {
    viewMore.style.display = 'none';
    viewLess.style.display = 'block';
    height.style.height = 'auto';
  });

  viewLess.addEventListener('click', () => {
    viewLess.style.display = 'none';
    viewMore.style.display = 'block';
    if (window.matchMedia('(min-width: 900px)').matches) {
      height.style.height = '628px';
    } else {
      height.style.height = '388px';
    }
  });
}
