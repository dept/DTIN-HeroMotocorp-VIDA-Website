export default function decorate(block) {
  // Clear the block first
  block.innerHTML = '';

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'savings-calculator';

  // Heading
  const heading = document.createElement('h2');
  heading.textContent = 'Turn your daily rides into real savings';
  wrapper.append(heading);

  // Card container
  const card = document.createElement('div');
  card.className = 'calculator-card';

  // Left section
  const left = document.createElement('div');
  left.className = 'calculator-left';
  left.innerHTML = `
    <p>The more you ride the more you save on your VIDA V2 Pro. 
    What’s your daily usage?</p>

    <label for="distance">Daily Distance 
      <span id="distance-value">0km</span>
    </label>

    <input type="range" id="distance" min="0" max="100" value="15" step="1">

    <div class="scale">
      <span>15 km</span>
      <span>100 km</span>
    </div>

    <div class="assumption">
    <p>Assumptions:</p>
    <p>Cost of running of petrol scooter is calculated at fuel cost of <span>₹100/L</span> and mileage of <span>40km/l.</span> Electricity cost of <span>₹10/unit</span> and distance of <span>35 km/unit</span></p>
    </div>
  `;

  // Right section
  const right = document.createElement('div');
  right.className = 'calculator-right';
  right.innerHTML = `
    <div>

    <div>
    <p>Annual running cost for a Petrol Vehicle</p>
    <p id="petrol-cost">₹0</p>
    </div>

    <div>
    <p>Annual running cost for a VIDA V2 Pro</p>
    <p id="vida-cost">₹0</p>
    </div>
    </div>
    <div class="saved">
    <p>Saved annually</p>
    <p id="savings">₹0</p>
    </div>
  `;

  // Append sections
  card.append(left, right);
  wrapper.append(card);
  block.append(wrapper);

  // === Calculator Logic ===
  const distanceInput = left.querySelector('#distance');
  const distanceValue = left.querySelector('#distance-value');
  const petrolCost = right.querySelector('#petrol-cost');
  const vidaCost = right.querySelector('#vida-cost');
  const savings = right.querySelector('#savings');

  // Constants
  const PETROL_PRICE = 100; // ₹ per litre
  const PETROL_MILEAGE = 40; // km per litre
  const ELECTRICITY_COST = 10; // ₹ per unit
  const VIDA_MILEAGE = 35; // km per unit
  const DAYS = 365;

  function calculate() {
    const dailyKm = parseInt(distanceInput.value, 10);
    distanceValue.textContent = `${dailyKm}km`;

    const annualPetrol = (dailyKm / PETROL_MILEAGE) * PETROL_PRICE * DAYS;
    const annualVida = (dailyKm / VIDA_MILEAGE) * ELECTRICITY_COST * DAYS;
    const annualSavings = annualPetrol - annualVida;

    petrolCost.textContent = `₹${annualPetrol.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    vidaCost.textContent = `₹${annualVida.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    savings.textContent = `₹${annualSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  function updateSliderFill() {
    const min = parseFloat(distanceInput.min) || 0;
    const max = parseFloat(distanceInput.max) || 100;
    const val = parseFloat(distanceInput.value);
    const pct = ((val - min) / (max - min)) * 100;
    // set the CSS variable used in the gradient
    distanceInput.style.setProperty('--percent', `${pct}%`);
  }

  // run on input and on init
  distanceInput.addEventListener('input', () => {
    updateSliderFill();
    calculate(); // your existing function that updates numbers
  });
  updateSliderFill();

  // initial render + event listener
  calculate();
  distanceInput.addEventListener('input', calculate);
}
