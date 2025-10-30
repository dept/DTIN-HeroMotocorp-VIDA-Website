export default async function decorate() {
  function setSectionHeight(section) {
    const pictures = section.querySelectorAll('p picture img');
    if (pictures.length < 2) return;

    // choose which image to use
    const img = window.innerWidth <= 900 ? pictures[0] : pictures[1];

    // wait until image is loaded before setting height
    if (!img.complete) {
      img.onload = () => {
        section.style.height = `${img.offsetHeight}px`;
      };
    } else {
      section.style.height = `${img.offsetHeight}px`;
    }
  }

  function updateAllSections() {
    const sections = document.querySelectorAll('.hero-main, .hero-component');
    sections.forEach((section) => setSectionHeight(section));
  }

  updateAllSections();

  // Run on resize
  window.addEventListener('resize', updateAllSections);
}
