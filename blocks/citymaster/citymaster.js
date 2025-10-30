import { cityMaster, createCityMasterDropdown } from '../../scripts/common.js';

export default function decorate(block) {
  const citymasterBlock = document.querySelector('.citymaster.block');
  if (citymasterBlock) {
    const lastDiv = citymasterBlock.querySelector(':scope > div:last-child');
    if (lastDiv) lastDiv.classList.add('city-master-dropdown');
  }

  const container = block.querySelector('.city-master-dropdown div');
  if (container) {
    const dropdown = createCityMasterDropdown(cityMaster);
    if (dropdown) container.prepend(dropdown);
  }
}
