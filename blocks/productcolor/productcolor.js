export default function decorate(block) {
  const variants = [...block.children]; // all color divs
  const dotsContainer = document.createElement('div');
  dotsContainer.classList.add('color-dots');

  variants.forEach((variant, index) => {
    variants[index].style.display = 'block';
    variant.classList.add('productcolor-variant');

    // Get elements
    const colorElement = variant.querySelector('p:last-of-type');
    const colorValue = colorElement?.textContent?.trim() || '#ccc';

    // Create color dot dynamically
    const dot = document.createElement('span');
    dot.classList.add('dot');
    dot.dataset.index = index;
    dot.title = colorValue;
    dot.style.backgroundColor = colorValue;

    // Hide all variants except the first one
    if (index !== 0) {
      variant.style.display = 'none';
    } else {
      dot.classList.add('active');
    }

    dotsContainer.appendChild(dot);
  });

  // Append dots after all variants
  block.appendChild(dotsContainer);

  // Add click functionality
  dotsContainer.addEventListener('click', (e) => {
    const dot = e.target.closest('.dot');
    if (!dot) return;

    const index = parseInt(dot.dataset.index, 10);

    // Hide all variants
    // eslint-disable-next-line no-return-assign
    variants.forEach((v) => (v.style.display = 'none'));
    dotsContainer.querySelectorAll('.dot').forEach((d) => d.classList.remove('active'));

    // Show selected variant
    variants[index].style.display = 'block';
    dot.classList.add('active');
  });
}
