document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('priceCalcForm');
  const pricePerUnitInput = document.getElementById('pricePerUnit');
  const weightInput = document.getElementById('weight');
  const unitSelect = document.getElementById('unit');
  const itemNameInput = document.getElementById('itemName');
  const resultDiv = document.getElementById('result');
  const itemList = document.getElementById('itemList');

  const INR_TO_USD = 82;
  let items = [];
  let unnamedCount = 1; // Counter for unnamed items

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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    resultDiv.textContent = '';

    // Always add the current form as a new item, even if fields are empty or invalid
    const pricePerUnit = parseFloat(pricePerUnitInput.value) || 0;
    let weight = parseFloat(weightInput.value) || 0;
    const unit = unitSelect.value;
    let itemName = itemNameInput.value.trim();

    if (!itemName) {
      itemName = `Item ${unnamedCount++}`;
    }

    // Only add if price or weight is not zero (optional: remove this check if you want to allow zero-value items)
    if (pricePerUnit > 0 && weight > 0) {
      items.push({
        name: itemName,
        pricePerUnit,
        weight,
        unit
      });
    }

    renderItemList();

    // Clear inputs after adding
    itemNameInput.value = '';
    pricePerUnitInput.value = '';
    weightInput.value = '';
    unitSelect.value = 'kg';

    // Calculate total
    let totalINR = 0;
    items.forEach(item => {
      let adjustedWeight = item.weight;
      if (item.unit === 'g') {
        adjustedWeight = item.weight / 1000;
      }
      const itemTotal = item.pricePerUnit * adjustedWeight;
      totalINR += itemTotal;
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

    // If no items, show 0 price
    if (items.length === 0) {
      resultDiv.style.color = '#2c3e50';
      resultDiv.innerHTML = `<strong>Total: ₹0.00 / $0.00</strong>`;
    } else {
      resultDiv.style.color = '#2c3e50';
      resultDiv.innerHTML = `<strong>Total: ${formattedINR} / ${formattedUSD}</strong>`;
    }
  });
});
