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
    } else if (selectedUnit === 'doz') {
      unit2Select.innerHTML = `
        <option value="pcs">Pieces (pcs) टुकड़े</option>
        <option value="doz">Dozen (doz) दर्जन</option>
      `;
    }
    else if (selectedUnit === 'pcs') {
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
      weightInput.step = '1';
      weightInput.min = '0';
      weightInput.type = 'number';
    } else if (unitSelect.value === 'pcs') {
      weightInput.value = 1;
      weightInput.step = '1';
      weightInput.min = '0';
      weightInput.type = 'number';
    } else {
      weightInput.value = 1; // Default to 1 for other units
      weightInput.step = '0.001';
      weightInput.min = '0';
      weightInput.type = 'decimal';
    }
  });

  unit2Select.addEventListener('change', () => {
    const selectedWeightUnit = unit2Select.value;
    if (selectedWeightUnit === 'g' || selectedWeightUnit === 'ml' || selectedWeightUnit === 'doz' || selectedWeightUnit === 'pcs') {
      weightInput.step = '1';
      weightInput.min = '0';
      weightInput.value = weightInput.value ? Math.floor(weightInput.value) : '';
      weightInput.type = 'number';
    } else {
      weightInput.step = '0.001';
      weightInput.min = '0';
      weightInput.type = 'decimal';
    }
  });

  function getAdjustedWeight(weight, priceUnit, weightUnit) {
  // If units match, return as is
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
  // doz <-> pcs
  if (priceUnit === 'doz' && weightUnit === 'pcs') {
    return weight / 12;
  }
  if (priceUnit === 'pcs' && weightUnit === 'doz') {
    return weight * 12;
  }
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

      const textSpan = document.createElement('span');
      let adjustedWeight = getAdjustedWeight(item.weight, item.priceUnit, item.unit);
      // FIX: Use unitValue for per-unit calculation
      let pricePer1Unit = item.pricePerUnit / (item.unitValue || 1);
      let itemTotal = pricePer1Unit * adjustedWeight;
      let itemLabel = item.name.startsWith('Item ') ? 'Item' : item.name;
      textSpan.textContent = `${idx + 1}. ${itemLabel} (${item.weight} ${item.unit}) @ Rs${item.pricePerUnit}/${item.unitValue} ${item.priceUnit}`;

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
        unitValue: parseFloat(document.getElementById('unitValue').value) || 1,
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
      let pricePer1Unit = item.pricePerUnit / (item.unitValue || 1);
      const itemTotal = pricePer1Unit * adjustedWeight;
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

    renderItemList();

    // Reset unitValue to 1 after calculation
    document.getElementById('unitValue').value = 1;
  });

  // WhatsApp sharing logic
  function createWhatsAppButton(pdfBlob) {
    // Remove existing button if any
    const oldBtn = document.getElementById('whatsappShareBtn');
    if (oldBtn) oldBtn.remove();

    // Create WhatsApp share button
    const btn = document.createElement('button');
    btn.id = 'whatsappShareBtn';
    btn.style.background = '#25D366';
    btn.style.border = 'none';
    btn.style.borderRadius = '50%';
    btn.style.width = '48px';
    btn.style.height = '48px';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.cursor = 'pointer';
    btn.style.marginTop = '12px';
    btn.title = 'Share PDF on WhatsApp';

    // WhatsApp SVG icon
    btn.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 32 32" fill="white">
        <path d="M16.001 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.47 1.74 6.41l-1.84 6.73 6.9-1.81c1.87 1.02 3.98 1.57 6.01 1.57h.01c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.8-12.8-12.8zm0 23.36c-1.81 0-3.74-.48-5.36-1.38l-.38-.22-4.1 1.08 1.1-4.01-.25-.41c-1.09-1.77-1.67-3.82-1.67-5.92 0-6.02 4.9-10.92 10.92-10.92s10.92 4.9 10.92 10.92-4.9 10.92-10.92 10.92zm5.98-8.13c-.33-.17-1.95-.96-2.25-1.07-.3-.11-.52-.17-.74.17-.22.33-.85 1.07-1.04 1.29-.19.22-.38.25-.71.08-.33-.17-1.39-.51-2.65-1.62-.98-.87-1.64-1.94-1.83-2.27-.19-.33-.02-.51.14-.68.14-.14.33-.37.5-.56.17-.19.22-.33.33-.55.11-.22.06-.41-.03-.58-.09-.17-.74-1.78-1.01-2.44-.27-.65-.54-.56-.74-.57-.19-.01-.41-.01-.63-.01-.22 0-.58.08-.88.37-.3.29-1.15 1.12-1.15 2.73 0 1.61 1.18 3.17 1.34 3.39.16.22 2.33 3.57 5.65 4.87.79.34 1.41.54 1.89.69.79.25 1.51.21 2.08.13.64-.09 1.95-.8 2.23-1.57.28-.77.28-1.43.2-1.57-.08-.14-.3-.22-.63-.39z"/>
      </svg>
    `;

    btn.onclick = async () => {
      // Use Web Share API if available (for mobile)
      if (navigator.canShare && navigator.canShare({ files: [pdfBlob] })) {
        const file = new File([pdfBlob], 'bill.pdf', { type: 'application/pdf' });
        try {
          await navigator.share({
            files: [file],
            title: 'My Bill Calculator',
            text: 'Here is my bill PDF.'
          });
        } catch (err) {
          alert('Sharing cancelled or failed.');
        }
      } else {
        // Fallback: Show a message with WhatsApp web link (cannot send files directly)
        const url = 'https://wa.me/?text=My%20Bill%20PDF%20is%20ready.%20Please%20download%20from%20the%20site.';
        window.open(url, '_blank');
      }
    };

    resultDiv.parentNode.insertBefore(btn, resultDiv.nextSibling);
  }

  // Generate PDF and show WhatsApp button after calculation
  function generateAndSharePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 15;
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('My Bill Calculator', 10, y);

    y += 12;
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);

    if (items.length === 0) {
      doc.text('No items added.', 10, y);
      y += 10;
    } else {
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
        let pricePer1Unit = item.pricePerUnit / (item.unitValue || 1);
        const itemTotal = pricePer1Unit * adjustedWeight;
        let itemLabel = item.name.startsWith('Item ') ? 'Item' : item.name;
        let qtyStr = `${item.weight} ${item.unit}`;
        let rateStr = `${item.pricePerUnit}/${item.unitValue} ${item.priceUnit}`;
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

      let totalINR = 0;
      items.forEach(item => {
        let adjustedWeight = getAdjustedWeight(item.weight, item.priceUnit, item.unit);
        let pricePer1Unit = item.pricePerUnit / (item.unitValue || 1);
        const itemTotal = pricePer1Unit * adjustedWeight;
        totalINR += itemTotal;
      });
      y += 5;
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text(`Total: Rupees ${totalINR.toFixed(2)}`, 115, y);
    }

    doc.save('bill.pdf'); // Save for download (optional)
    doc.output('blob').then(blob => {
      createWhatsAppButton(blob);
    });
  }

  // Call generateAndSharePDF after calculation
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
        unitValue: parseFloat(document.getElementById('unitValue').value) || 1,
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
      let pricePer1Unit = item.pricePerUnit / (item.unitValue || 1);
      const itemTotal = pricePer1Unit * adjustedWeight;
      totalINR += itemTotal;
    });

    if (items.length === 0) {
      resultDiv.style.color = '#2c3e50';
      resultDiv.innerHTML = `<strong>Total: ₹0.00</strong>`;
    } else {
      resultDiv.style.color = '#2c3e50';
      resultDiv.innerHTML = `<strong>Total: ₹${totalINR.toFixed(2)}</strong>`;
    }

    renderItemList();

    // Reset unitValue to 1 after calculation
    document.getElementById('unitValue').value = 1;

    // Generate and share PDF
    generateAndSharePDF();
  });

  // Remove the old downloadPdfBtn from HTML if present
  const oldDownloadBtn = document.getElementById('downloadPdfBtn');
  if (oldDownloadBtn) oldDownloadBtn.remove();

 
});
