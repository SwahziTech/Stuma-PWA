const fs = require('fs');

let code = fs.readFileSync('scratch/build_sales_code.js', 'utf8');

// Replace savedDraft logic
const oldSavedDraft = `  // Point 2: Persistent State Storage across Tab Switches
  const DRAFT_KEY = "stumarcot_sales_tab_draft_v3";
  const savedDraft = B.useMemo(() => {
    try {
      if (window._stumarcot_sales_draft) return window._stumarcot_sales_draft;
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        window._stumarcot_sales_draft = parsed;
        return parsed;
      }
    } catch (err) {}
    return {};
  }, []);`;

const newSavedDraft = `  // Persistent In-Memory State: survives tab switches, but resets on whole app/web refresh
  const savedDraft = B.useMemo(() => {
    try {
      // Clear any legacy sessionStorage so a full web refresh always resets completely
      sessionStorage.removeItem("stumarcot_sales_tab_draft_v3");
      sessionStorage.removeItem("stumarcot_sales_tab_draft_v2");
      sessionStorage.removeItem("stumarcot_sales_tab_draft");
      if (window._stumarcot_sales_draft) return window._stumarcot_sales_draft;
    } catch (err) {}
    return {};
  }, []);`;

if (!code.includes(oldSavedDraft)) {
  console.error('oldSavedDraft not found in code!');
  process.exit(1);
}
code = code.replace(oldSavedDraft, newSavedDraft);

// Replace useEffect persistence logic
const oldEffect = `  // Point 2: Persist state continuously so switching tabs does not reset filled data
  B.useEffect(() => {
    try {
      const draftObj = {
        saleDate,
        customerName,
        customerContacts,
        deliverySite,
        customerTin,
        selectedItemId,
        selectedColor,
        sellingPriceInput,
        isCustomPrice,
        quantityInput,
        paymentAccount,
        addedProducts,
        stagedSales
      };
      window._stumarcot_sales_draft = draftObj;
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draftObj));
    } catch (e) {}
  }, [saleDate, customerName, customerContacts, deliverySite, customerTin, selectedItemId, selectedColor, sellingPriceInput, isCustomPrice, quantityInput, paymentAccount, addedProducts, stagedSales]);`;

const newEffect = `  // Persist state in memory across tab switches (cleared when whole web app reloads)
  B.useEffect(() => {
    try {
      window._stumarcot_sales_draft = {
        saleDate,
        customerName,
        customerContacts,
        deliverySite,
        customerTin,
        selectedItemId,
        selectedColor,
        sellingPriceInput,
        isCustomPrice,
        quantityInput,
        paymentAccount,
        addedProducts,
        stagedSales
      };
    } catch (e) {}
  }, [saleDate, customerName, customerContacts, deliverySite, customerTin, selectedItemId, selectedColor, sellingPriceInput, isCustomPrice, quantityInput, paymentAccount, addedProducts, stagedSales]);`;

if (!code.includes(oldEffect)) {
  console.error('oldEffect not found in code!');
  process.exit(1);
}
code = code.replace(oldEffect, newEffect);

// Replace confirm dispatch draft clear
code = code.replace(
  'sessionStorage.removeItem(DRAFT_KEY);',
  '// in-memory cleared'
);

fs.writeFileSync('scratch/build_sales_code.js', code, 'utf8');
console.log('Successfully updated scratch/build_sales_code.js with in-memory tab persistence!');
