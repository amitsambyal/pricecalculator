document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('priceCalcForm');
  const pricePerUnitInput = document.getElementById('pricePerUnit');
  const weightInput = document.getElementById('weight');
  const unitSelect = document.getElementById('unit');
  const unit2Select = document.getElementById('unit2'); // Weight/quantity unit dropdown
  const itemNameInput = document.getElementById('itemName');
  const resultDiv = document.getElementById('result');
  const itemList = document.getElementById('itemList');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');

  const INR_TO_USD = 82;
  let items = [];
  let unnamedCount = 1; // Counter for unnamed items

  // --- Unit sync logic ---
  function updateUnit2Options() {
    const selectedUnit = unitSelect.value;
    unit2Select.innerHTML = ''; // Clear previous options

    if (selectedUnit === 'kg') {
      unit2Select.innerHTML = `
        <option value="kg">Kilogram (kg) किलो</option>
        <option value="g">Gram (gm) ग्राम</option>
      `;
    } else if (selectedUnit === 'ltr') {
      unit2Select.innerHTML = `
        <option value="ltr">Litre (ltr) लीटर</option>
        <option value="ml">Millilitre (ml) मिलीलीटर</option>
      `;
    } else if (selectedUnit === 'doz' || selectedUnit === 'pcs') {
      unit2Select.innerHTML = `
        <option value="pcs">Pieces (pcs) टुकड़े</option>
      `;
    }
  }

  // Initial call and event binding
  updateUnit2Options();
  unitSelect.addEventListener('change', () => {
    updateUnit2Options();
    // Set default weight value based on selected price unit
    if (unitSelect.value === 'doz') {
      weightInput.value = 12;
    }  else {
      weightInput.value = 1; // Default to 1 for other units
    }
  });

  function getAdjustedWeight(weight, priceUnit, weightUnit) {
    // Convert weight to the price unit for calculation
    if (priceUnit === weightUnit) {
      return weight;
    }
    // kg <-> g
    if (priceUnit === 'kg' && weightUnit === 'g') {
      return weight / 1000;
    }
    if (priceUnit === 'g' && weightUnit === 'kg') {
      return weight * 1000;
    }
    // ltr <-> ml
    if (priceUnit === 'ltr' && weightUnit === 'ml') {
      return weight / 1000;
    }
    if (priceUnit === 'ml' && weightUnit === 'ltr') {
      return weight * 1000;
    }
    // If weight is entered in dozen, convert to pieces (1 dozen = 12 pieces)
    if (weightUnit === 'pcs') {
      return weight / 12;
    }
    // doz <-> pcs or pcs <-> pcs (no conversion needed)
    // If units don't match and are not convertible, treat as 0
    return weight;
  }

  function renderItemList() {
    itemList.innerHTML = '';
    items.forEach((item, idx) => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';
      li.style.padding = '4px 0';

      // If no item name, display as blank (not "Item 1", "Item 2", etc.)
      const textSpan = document.createElement('span');
      let adjustedWeight = getAdjustedWeight(item.weight, item.priceUnit, item.unit);
      let itemTotal = item.pricePerUnit * adjustedWeight;
      let pricePerPieceText = '';
      let itemLabel = item.name.startsWith('Item ') ? 'Item' : item.name; // Show just "Item" if no name
      if (item.unit === 'pcs') {
        pricePerPieceText = ` (Rs${(itemTotal / item.weight).toFixed(2)} per piece)`;
      }
      textSpan.textContent = `${idx + 1}. ${itemLabel} (${item.weight} ${item.unit}) @ Rs${item.pricePerUnit}/${item.priceUnit}${pricePerPieceText}`;

      const priceSpan = document.createElement('span');
      priceSpan.textContent = `Rs${itemTotal.toFixed(2)}`;
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
        if (items.length === 0) {
          downloadPdfBtn.style.display = 'none';
        }
      };

      li.appendChild(textSpan);
      li.appendChild(priceSpan);
      li.appendChild(removeSpan);
      itemList.appendChild(li);
    });

    // Show download PDF link only if at least one item is present
    if (items.length > 0) {
      downloadPdfBtn.style.display = 'inline-block';
    } else {
      downloadPdfBtn.style.display = 'none';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    resultDiv.textContent = '';

    const pricePerUnit = parseFloat(pricePerUnitInput.value) || 0;
    let weight = parseFloat(weightInput.value) || 0;
    const priceUnit = unitSelect.value;
    const weightUnit = unit2Select.value;
    let itemName = itemNameInput.value.trim();

    if (!itemName) {
      itemName = `Item ${unnamedCount++}`;
    }

    if (pricePerUnit > 0 && weight > 0) {
      items.push({
        name: itemName,
        pricePerUnit,
        weight,
        priceUnit, // price per this unit
        unit: weightUnit // weight/quantity entered in this unit
      });
    }

    renderItemList();

    // Clear inputs after adding
    itemNameInput.value = '';
    pricePerUnitInput.value = '';
    weightInput.value = '';
    unitSelect.value = 'kg';
    updateUnit2Options();

    // Calculate total
    let totalINR = 0;
    items.forEach(item => {
      let adjustedWeight = getAdjustedWeight(item.weight, item.priceUnit, item.unit);
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

    if (items.length === 0) {
      resultDiv.style.color = '#2c3e50';
      resultDiv.innerHTML = `<strong>Total: Rs0.00 / $0.00</strong>`;
    } else {
      resultDiv.style.color = '#2c3e50';
      resultDiv.innerHTML = `<strong>Total: ${formattedINR.replace('₹', 'Rs')} / ${formattedUSD}</strong>`;
    }
  });

  // PDF download as a link
  downloadPdfBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 15;
    // Dark header
    doc.setFillColor(44, 62, 80); // dark blue/grey
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('My Bill Calculator', 10, y);

    y += 12;
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80); // dark text for items

    if (items.length === 0) {
      doc.text('No items added.', 10, y);
      y += 10;
    } else {
      items.forEach((item, idx) => {
        let adjustedWeight = getAdjustedWeight(item.weight, item.priceUnit, item.unit);
        const itemTotal = item.pricePerUnit * adjustedWeight;
        let itemLabel = item.name.startsWith('Item ') ? 'Item' : item.name; // Show just "Item" if no name
        let line = `${idx + 1}. ${itemLabel} (${item.weight} ${item.unit}) @ Rs${item.pricePerUnit}/${item.priceUnit} = Rs${itemTotal.toFixed(2)}`;
        if (item.unit === 'pcs' && item.weight > 0) {
          line += ` (Rs${(itemTotal / item.weight).toFixed(2)} per piece)`;
        }
        doc.text(line, 10, y);
        y += 8;
        if (y > 270) {
          doc.addPage();
          y = 15;
        }
      });

      // Calculate total
      let totalINR = 0;
      items.forEach(item => {
        let adjustedWeight = getAdjustedWeight(item.weight, item.priceUnit, item.unit);
        const itemTotal = item.pricePerUnit * adjustedWeight;
        totalINR += itemTotal;
      });
      const totalUSD = totalINR / INR_TO_USD;
      y += 5;
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text(`Total: Rs${totalINR.toFixed(2)} / $${totalUSD.toFixed(2)}`, 10, y);
    }

    doc.save('bill.pdf');
  });
});
