document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('priceCalcForm');
  const pricePerUnitInput = document.getElementById('pricePerUnit');
  const weightInput = document.getElementById('weight');
  const unitSelect = document.getElementById('unit');
  const itemNameInput = document.getElementById('itemName');
  const resultDiv = document.getElementById('result');
  const addItemBtn = document.getElementById('addItemBtn');
  const itemList = document.getElementById('itemList');

  const INR_TO_USD = 82;
  let items = [];

  function renderItemList() {
    itemList.innerHTML = '';
    items.forEach((item, idx) => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';
      li.style.padding = '4px 0';

      const textSpan = document.createElement('span');
      textSpan.textContent = `${item.name} (${item.weight} ${item.unit}) @ ₹${item.pricePerUnit}/${item.unit}`;

      // Calculate price for this item
      let adjustedWeight = item.weight;
      if (item.unit === 'g') {
        adjustedWeight = item.weight / 1000;
      }
      const itemTotal = item.pricePerUnit * adjustedWeight;
      const priceSpan = document.createElement('span');
      priceSpan.textContent = `₹${itemTotal.toFixed(2)}`;
      priceSpan.style.marginLeft = '16px';
      priceSpan.style.fontWeight = 'bold';

      const removeSpan = document.createElement('span');
      removeSpan.textContent = '×';
      removeSpan.title = 'Remove';
      removeSpan.style.color = '#e74c3c';
      removeSpan.style.fontSize = '20px';
      removeSpan.style.cursor = 'pointer';
      removeSpan.style.marginLeft = '16px';
      removeSpan.onclick = () => {
        items.splice(idx, 1);
        renderItemList();
      };

      li.appendChild(textSpan);
      li.appendChild(priceSpan);
      li.appendChild(removeSpan);
      itemList.appendChild(li);
    });
  }

  addItemBtn.addEventListener('click', () => {
    const pricePerUnit = parseFloat(pricePerUnitInput.value);
    let weight = parseFloat(weightInput.value);
    const unit = unitSelect.value;
    const itemName = itemNameInput.value.trim() || 'Item';

    // Validate inputs
    if (isNaN(pricePerUnit) || pricePerUnit <= 0) {
      resultDiv.textContent = 'Please enter a valid positive number for price per unit.';
      resultDiv.style.color = '#e74c3c';
      return;
    }
    if (isNaN(weight) || weight <= 0) {
      resultDiv.textContent = 'Please enter a valid positive number for weight/quantity.';
      resultDiv.style.color = '#e74c3c';
      return;
    }

    items.push({
      name: itemName,
      pricePerUnit,
      weight,
      unit
    });

    renderItemList();

    // Clear inputs
    itemNameInput.value = '';
    pricePerUnitInput.value = '';
    weightInput.value = '';
    unitSelect.value = 'kg';
    resultDiv.textContent = '';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    resultDiv.textContent = '';

    // Only show result if at least one item is added
    if (items.length === 0) {
      resultDiv.textContent = 'Please add at least one item.';
      resultDiv.style.color = '#e74c3c';
      return;
    }

    let totalINR = 0;
    let summary = '';
    items.forEach(item => {
      let adjustedWeight = item.weight;
      if (item.unit === 'g') {
        adjustedWeight = item.weight / 1000;
      }
      // For other units, no conversion needed (ltr, doz)
      const itemTotal = item.pricePerUnit * adjustedWeight;
      totalINR += itemTotal;
      summary += `${item.name} (${item.weight} ${item.unit}): ₹${itemTotal.toFixed(2)}\n`;
    });

    const totalUSD = totalINR / INR_TO_USD;
    const formattedINR = totalINR.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const formattedUSD = totalUSD.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    resultDiv.style.color = '#2c3e50';
    resultDiv.innerHTML = `<pre>${summary}</pre><strong>Total: ${formattedINR} / ${formattedUSD}</strong>`;
  });
});
