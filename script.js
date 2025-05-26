document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('priceCalcForm');
  const pricePerUnitInput = document.getElementById('pricePerUnit');
  const weightInput = document.getElementById('weight');
  const unitSelect = document.getElementById('unit');
  const itemNameInput = document.getElementById('itemName');
  const resultDiv = document.getElementById('result');

  // Conversion rate INR to USD (example rate)
  const INR_TO_USD = 82;

  form.addEventListener('submit', () => {
    // Clear previous result
    resultDiv.textContent = '';

    // Get inputs and parse
    const pricePerUnit = parseFloat(pricePerUnitInput.value);
    const weight = parseFloat(weightInput.value);
    const unit = unitSelect.value;
    const itemName = itemNameInput.value.trim() || 'Item';

    // Validate inputs
    if (isNaN(pricePerUnit) || pricePerUnit <= 0) {
      resultDiv.textContent = 'Please enter a valid positive number for price per unit.';
      resultDiv.style.color = '#e74c3c'; // red
      return;
    }
    if (isNaN(weight) || weight <= 0) {
      resultDiv.textContent = 'Please enter a valid positive number for weight/quantity.';
      resultDiv.style.color = '#e74c3c'; // red
      return;
    }

    // Calculate total price in INR
    const totalPriceINR = pricePerUnit * weight;

    // Convert INR to USD
    const totalPriceUSD = totalPriceINR / INR_TO_USD;

    // Format as currency
    const formattedINR = totalPriceINR.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const formattedUSD = totalPriceUSD.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Show result with both currencies
    resultDiv.style.color = '#2c3e50';
    resultDiv.textContent = `${itemName} (${weight} ${unit}) total price is ${formattedINR} / ${formattedUSD}`;
  });
});
