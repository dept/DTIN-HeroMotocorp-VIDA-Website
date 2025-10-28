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
}
