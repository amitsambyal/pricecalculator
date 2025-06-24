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
      //if (item.unit === 'pcs') {
       // pricePerPieceText = ` (Rs${(itemTotal / item.weight).toFixed(2)} per piece)`;
     // }
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
      let adjustedWeight = getAdjustedWeight(item.weight, item.priceUnit, item.unit); // FIXED: use item.priceUnit
      const itemTotal = item.pricePerUnit * adjustedWeight;
      totalINR += itemTotal;
    });

    // Remove USD calculation and formatting
    // const totalUSD = totalINR / INR_TO_USD;
    // const formattedUSD = totalUSD.toLocaleString('en-US', {
    //   style: 'currency',
    //   currency: 'USD',
    //   minimumFractionDigits: 2,
    //   maximumFractionDigits: 2,
    // });

    if (items.length === 0) {
      resultDiv.style.color = '#2c3e50';
      resultDiv.innerHTML = `<strong>Total: ₹0.00</strong>`;
    } else {
      resultDiv.style.color = '#2c3e50';
      resultDiv.innerHTML = `<strong>Total: ₹${totalINR.toFixed(2)}</strong>`;
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
      // Table headers
      doc.setFont(undefined, 'bold');
      doc.text('S.No', 10, y);
      doc.text('Item Name', 25, y);
      doc.text('Qty', 90, y);
      doc.text('Rate (Rupees)', 115, y);
      doc.text('Amount in Rupees', 150, y);
      doc.setFont(undefined, 'normal');
      y += 8;

      items.forEach((item, idx) => {
        let adjustedWeight = getAdjustedWeight(item.weight, item.priceUnit, item.unit);
        const itemTotal = item.pricePerUnit * adjustedWeight;
        let itemLabel = item.name.startsWith('Item ') ? 'Item' : item.name; // Show just "Item" if no name

        // Format quantity string
        let qtyStr = `${item.weight} ${item.unit}`;
        // Format rate string
        let rateStr = `${item.pricePerUnit}/${item.priceUnit}`;
        // Format amount string
        let amtStr = `${itemTotal.toFixed(2)}`;

        doc.text(String(idx + 1), 10, y);
        doc.text(itemLabel, 25, y);
        doc.text(qtyStr, 90, y);
        doc.text(rateStr, 115, y);
        doc.text(amtStr, 150, y);

        y += 8;
        if (y > 270) {
          doc.addPage();
          y = 15;
        }
      });

      // Calculate total
      let totalINR = 0;
      items.forEach(item => {
      let adjustedWeight = getAdjustedWeight(item.weight, item.priceUnit, item.unit); // FIXED: use item.priceUnit
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
