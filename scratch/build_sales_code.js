const fs = require('fs');

// We will construct the complete b1 component code and inject it into assets/index-hgjhj-0G.js
const b1ComponentCode = `b1=({prefillItemId:s,onClearPrefill:t,onSuccess:r})=>{
  const {items:a, movements:c, addMovementsBatch:u, getStockSummary:d, staffName:f, adminSettings:adm} = Vt();
  const m = B.useMemo(() => new Date().toISOString().split("T")[0], []);

  // Persistent In-Memory State: survives tab switches, but resets on whole app/web refresh
  const savedDraft = B.useMemo(() => {
    try {
      // Clear any legacy sessionStorage so a full web refresh always resets completely
      sessionStorage.removeItem("stumarcot_sales_tab_draft_v3");
      sessionStorage.removeItem("stumarcot_sales_tab_draft_v2");
      sessionStorage.removeItem("stumarcot_sales_tab_draft");
      if (window._stumarcot_sales_draft) return window._stumarcot_sales_draft;
    } catch (err) {}
    return {};
  }, []);

  // Point 1: Tanzanian Phone Number Validator
  // Validates: 07XXXXXXXX, 06XXXXXXXX (10 digits) or +2556/7XXXXXXXX, 2556/7XXXXXXXX
  const validateTzPhone = B.useCallback((phone) => {
    if (!phone) return false;
    const clean = String(phone).replace(/[\\s\\-\\(\\)\\.]/g, "");
    return /^(?:\\+?255|0)[67]\\d{8}$/.test(clean);
  }, []);
  
  // Date State
  const [saleDate, setSaleDate] = B.useState(savedDraft.saleDate || m);

  // Card 1: Customer Details State (Sticky across multiple products)
  const [customerName, setCustomerName] = B.useState(savedDraft.customerName || "");
  const [customerContacts, setCustomerContacts] = B.useState(savedDraft.customerContacts || "");
  const [deliverySite, setDeliverySite] = B.useState(savedDraft.deliverySite || "");
  const [customerTin, setCustomerTin] = B.useState(savedDraft.customerTin || "");

  // Phone number validity (soft helper when contacts entered)
  const isPhoneValid = B.useMemo(() => {
    if (!customerContacts.trim()) return true;
    return validateTzPhone(customerContacts);
  }, [customerContacts, validateTzPhone]);

  // Customer info is optional for now as requested
  const hasCustomerInfo = true;

  // Card 2: Active Product Selection & Money State
  // Point 1: Default "Select Product" (empty initially until selected)
  const [selectedItemId, setSelectedItemId] = B.useState(() => {
    if (s && a.some(it => it.id === s)) return s;
    return savedDraft.selectedItemId || "";
  });
  const [selectedColor, setSelectedColor] = B.useState(savedDraft.selectedColor || "White");
  const [sellingPriceInput, setSellingPriceInput] = B.useState(savedDraft.sellingPriceInput || "");
  const [isCustomPrice, setIsCustomPrice] = B.useState(savedDraft.isCustomPrice || false);
  const [quantityInput, setQuantityInput] = B.useState(savedDraft.quantityInput || "");
  const [paymentAccount, setPaymentAccount] = B.useState(savedDraft.paymentAccount || "Cash");

  // Multi-product subcards: additional products added to this current customer sale
  const [addedProducts, setAddedProducts] = B.useState(savedDraft.addedProducts || []);

  // Card 3: Daily Sales Ledger (Staged sales ready to confirm)
  const [stagedSales, setStagedSales] = B.useState(savedDraft.stagedSales || []);
  const [editingSaleId, setEditingSaleId] = B.useState(null);

  // Modals & UI State
  const [showProductModal, setShowProductModal] = B.useState(false);
  const [productSearch, setProductSearch] = B.useState("");
  const [productCategoryFilter, setProductCategoryFilter] = B.useState("All");
  const [showColorDropdown, setShowColorDropdown] = B.useState(false);
  const [viewSaleDetail, setViewSaleDetail] = B.useState(null);
  const [showConfirmModal, setShowConfirmModal] = B.useState(false);
  const [isSubmitting, setIsSubmitting] = B.useState(false);
  const [successBanner, setSuccessBanner] = B.useState(null);

  // Persist state in memory across tab switches (cleared when whole web app reloads)
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
  }, [saleDate, customerName, customerContacts, deliverySite, customerTin, selectedItemId, selectedColor, sellingPriceInput, isCustomPrice, quantityInput, paymentAccount, addedProducts, stagedSales]);

  // Sorted items by sales velocity
  const velocityItems = B.useMemo(() => pg(a, c), [a, c]);
  const categoriesList = B.useMemo(() => {
    const setCats = new Set(a.map(it => it.category));
    return ["All", ...Array.from(setCats)];
  }, [a]);

  // Current active item object
  const activeItem = B.useMemo(() => {
    if (!selectedItemId) return null;
    return a.find(it => it.id === selectedItemId) || null;
  }, [a, selectedItemId]);

  // Point 2 & 3: Accurate Pricelist Resolver with Color Variation according to docs/price list 2026.xlsx
  // Unit is sqm for products with unit: "sqm" (Floor Tiles, Paving Blocks, Wall Tiles)
  const getItemPricelist = B.useCallback((item, colorName) => {
    if (!item) return { unitPrice: 0, sqmPrice: 0, defaultPrice: 0, isSqm: false, unitLabel: "pcs" };
    const name = (item.name || "").toLowerCase();
    const cat = (item.category || "").toLowerCase();
    const col = (colorName || "White").toLowerCase();
    const isSqm = item.unit === "sqm";

    // Products sold per SQM
    if (isSqm) {
      // Floor Tiles (standard White 25,500 Tsh/m²; Slab 16,500; Combo 32,500)
      if (cat.includes("floor") || cat.includes("wall")) {
        let baseSqm = 25500;
        if (name.includes("slab")) baseSqm = 16500;
        else if (name.includes("combo") && name.includes("800")) baseSqm = 32500;

        // Color rules from Excel row 48/60: Red 27,500 (+2k), Grey 27,500 (+2k), Black 31,500 (+6k)
        let colorSurcharge = 0;
        if (col.includes("red") || col.includes("grey") || col.includes("gray") || col.includes("maroon")) {
          colorSurcharge = 2000;
        } else if (col.includes("black")) {
          colorSurcharge = 6000;
        }
        const effectiveSqm = baseSqm + colorSurcharge;
        const perPc = Math.round(effectiveSqm / (item.pcs_per_sqm || 6));
        return { unitPrice: perPc, sqmPrice: effectiveSqm, defaultPrice: effectiveSqm, isSqm: true, unitLabel: "m²" };
      }

      // Slabs
      if (cat.includes("slab")) {
        const baseSqm = name.includes("110") ? 16500 : 32500;
        return { unitPrice: baseSqm, sqmPrice: baseSqm, defaultPrice: baseSqm, isSqm: true, unitLabel: "m²" };
      }

      // Paving Blocks (Vibration: White 29,500; Press: 80mm=31,500, 60mm=25,830, 40-45MPa=35,000)
      if (cat.includes("paving")) {
        const isVibro = name.includes("u-dot") || name.includes("u dot") || name.includes("z-plain") || name.includes("z plain") || name.includes("trio") || name.includes("culture") || name.includes("v paver") || name.includes("v-shape") || name.includes("kisu");
        if (isVibro) {
          // Vibration pavers from Excel: Red 31,500 (+2k), Grey 31,500 (+2k), Black 34,500 (+5k)
          let baseSqm = 29500;
          let colorSurcharge = 0;
          if (col.includes("red") || col.includes("grey") || col.includes("gray") || col.includes("maroon")) {
            colorSurcharge = 2000;
          } else if (col.includes("black")) {
            colorSurcharge = 5000;
          }
          const effectiveSqm = baseSqm + colorSurcharge;
          return { unitPrice: 1000, sqmPrice: effectiveSqm, defaultPrice: effectiveSqm, isSqm: true, unitLabel: "m²" };
        } else {
          // Press pavers from Excel: increase of Tsh 3000 per sqmt for Red and Grey
          let baseSqm = 31500;
          if (name.includes("40") || name.includes("45") || name.includes("mpa-40")) baseSqm = 35000;
          else if (name.includes("60") || name.includes("6cm") || name.includes("rough 6cm") || name.includes("worldcup")) baseSqm = 25830;

          let colorSurcharge = 0;
          if (col.includes("red") || col.includes("grey") || col.includes("gray") || col.includes("black") || col.includes("maroon")) {
            colorSurcharge = 3000;
          }
          const effectiveSqm = baseSqm + colorSurcharge;
          return { unitPrice: 630, sqmPrice: effectiveSqm, defaultPrice: effectiveSqm, isSqm: true, unitLabel: "m²" };
        }
      }

      return { unitPrice: 1000, sqmPrice: 25500, defaultPrice: 25500, isSqm: true, unitLabel: "m²" };
    }

    // Products sold per PIECE (pcs)
    // Culverts
    if (cat.includes("culvert") || name.includes("culvert")) {
      let p = 96000;
      if (name.includes("900n")) p = 146000;
      else if (name.includes("900r") || name.includes("600n")) p = 116000;
      else if (name.includes("600r") || name.includes("400n")) p = 96000;
      else if (name.includes("400r")) p = 76000;
      return { unitPrice: p, sqmPrice: 0, defaultPrice: p, isSqm: false, unitLabel: "pcs" };
    }

    // Kerbstones
    if (cat.includes("kerb") || cat.includes("curb")) {
      let p = 13500;
      if (name.includes("panasonic")) p = 18500;
      else if (name.includes("100") || name.includes("80")) p = 17500;
      else if (name.includes("60") || name.includes("50 press")) p = 13500;
      else if (name.includes("50") || name.includes("bevo") || name.includes("bevel")) p = 11500;
      return { unitPrice: p, sqmPrice: 0, defaultPrice: p, isSqm: false, unitLabel: "pcs" };
    }

    // Mifuniko / Covers
    if (cat.includes("mifuniko") || cat.includes("cover")) {
      let p = 11500;
      if (name.includes("mkubwa") || name.includes("cm80") || name.includes("cm60") || name.includes("nondo") || name.includes("ulalo")) p = 13500;
      return { unitPrice: p, sqmPrice: 0, defaultPrice: p, isSqm: false, unitLabel: "pcs" };
    }

    // Poles / Nguzo
    if (cat.includes("pole") || cat.includes("nguzo")) {
      let p = name.includes("bicon") ? 26000 : 8000;
      return { unitPrice: p, sqmPrice: 0, defaultPrice: p, isSqm: false, unitLabel: "pcs" };
    }

    // Blocks / Matofali
    if (cat.includes("block") || cat.includes("tofali") || cat.includes("matofali") || cat.includes("chipping")) {
      let p = 1770;
      if (name.includes("dust") || name.includes("chip") || name.includes('8"')) p = 2242;
      else if (name.includes("hollow")) p = 1888;
      return { unitPrice: p, sqmPrice: 0, defaultPrice: p, isSqm: false, unitLabel: "pcs" };
    }

    return { unitPrice: 1000, sqmPrice: 0, defaultPrice: 1000, isSqm: false, unitLabel: "pcs" };
  }, []);

  // Sync color & update selling price when active item changes
  B.useEffect(() => {
    if (activeItem) {
      let activeCol = selectedColor;
      if (activeItem.colors && activeItem.colors.length > 0) {
        if (!activeItem.colors.includes(selectedColor)) {
          activeCol = activeItem.colors[0];
          setSelectedColor(activeCol);
        }
      } else {
        activeCol = "Standard";
        setSelectedColor("Standard");
      }
      if (!isCustomPrice) {
        const pricing = getItemPricelist(activeItem, activeCol);
        setSellingPriceInput(String(pricing.defaultPrice));
      }
    }
  }, [activeItem]);

  // Point 3: Handle color change with automatic price adjustment
  const handleSelectColor = (col) => {
    setSelectedColor(col);
    setShowColorDropdown(false);
    if (!isCustomPrice && activeItem) {
      const pricing = getItemPricelist(activeItem, col);
      setSellingPriceInput(String(pricing.defaultPrice));
    }
  };

  // Handle prefill item from other tabs
  B.useEffect(() => {
    if (s && a.some(it => it.id === s)) {
      setSelectedItemId(s);
      setIsCustomPrice(false);
      setSellingPriceInput("");
      t && t();
    }
  }, [s, a]);

  // Current stock metrics
  const activeStock = B.useMemo(() => activeItem ? d(activeItem.id) : null, [activeItem, d]);
  const activePricelist = B.useMemo(() => getItemPricelist(activeItem, selectedColor), [activeItem, selectedColor, getItemPricelist]);
  
  // Point 2: Effective selling price per selling unit (sqm for sqm items, pcs for pcs items)
  const effectiveUnitPrice = B.useMemo(() => {
    if (isCustomPrice && sellingPriceInput !== "" && !isNaN(Number(sellingPriceInput))) {
      return Number(sellingPriceInput);
    }
    return activePricelist.defaultPrice;
  }, [isCustomPrice, sellingPriceInput, activePricelist]);

  const parsedQty = B.useMemo(() => {
    const q = parseFloat(quantityInput);
    return isNaN(q) || q < 0 ? 0 : q;
  }, [quantityInput]);

  const activeTotalAmount = B.useMemo(() => {
    return parsedQty * effectiveUnitPrice;
  }, [parsedQty, effectiveUnitPrice]);

  // Point 4: VAT & Discount calculations
  // VAT formula: VAT = price * (18 / 118)
  const unitVatAmount = B.useMemo(() => {
    return effectiveUnitPrice * (18 / 118);
  }, [effectiveUnitPrice]);

  const totalVatAmount = B.useMemo(() => {
    return activeTotalAmount * (18 / 118);
  }, [activeTotalAmount]);

  const discountDiff = B.useMemo(() => {
    return activePricelist.defaultPrice - effectiveUnitPrice;
  }, [activePricelist, effectiveUnitPrice]);

  const discountPct = B.useMemo(() => {
    if (activePricelist.defaultPrice <= 0) return 0;
    return (discountDiff / activePricelist.defaultPrice) * 100;
  }, [discountDiff, activePricelist]);

  // Filtered products for selection modal
  const filteredModalProducts = B.useMemo(() => {
    return velocityItems.filter(it => {
      const matchCat = productCategoryFilter === "All" || it.category === productCategoryFilter;
      const matchSearch = it.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          it.category.toLowerCase().includes(productSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [velocityItems, productCategoryFilter, productSearch]);

  // Helper to format currency
  const formatMoney = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "0";
    return Math.round(val).toLocaleString();
  };

  // Grand totals for bottom card & verification modal
  const totalSalesRevenue = B.useMemo(() => {
    return stagedSales.reduce((s, sa) => s + sa.totalAmount, 0) + 
      (stagedSales.length === 0 ? activeTotalAmount + addedProducts.reduce((s, p) => s + p.totalAmount, 0) : 0);
  }, [stagedSales, activeTotalAmount, addedProducts]);

  const totalSalesPieces = B.useMemo(() => {
    return stagedSales.reduce((s, sa) => s + sa.totalPcs, 0) +
      (stagedSales.length === 0 ? (activePricelist.isSqm && activeItem && activeItem.pcs_per_sqm ? Math.round(parsedQty * activeItem.pcs_per_sqm) : parsedQty) + addedProducts.reduce((s, p) => s + (p.qtyPcs || p.qty), 0) : 0);
  }, [stagedSales, activePricelist, activeItem, parsedQty, addedProducts]);

  const totalSalesSqm = B.useMemo(() => {
    const fromStaged = stagedSales.reduce((s, sa) => s + (sa.totalSqm || 0), 0);
    if (stagedSales.length > 0) return Number(fromStaged.toFixed(2));
    const activeSqm = activePricelist.isSqm ? parsedQty : 0;
    const addedSqm = addedProducts.reduce((s, p) => s + (p.sqm || 0), 0);
    return Number((activeSqm + addedSqm).toFixed(2));
  }, [stagedSales, activePricelist, parsedQty, addedProducts]);

  const salesAccountBreakdown = B.useMemo(() => {
    const map = {};
    for (const s of stagedSales) {
      for (const it of s.items) {
        const acc = it.account || "Cash";
        map[acc] = (map[acc] || 0) + (it.totalAmount || 0);
      }
    }
    return Object.entries(map);
  }, [stagedSales]);

  // Add Another Product to Sale subcard flow
  const handleAddAnotherProduct = () => {
    if (!activeItem) {
      setShowProductModal(true);
      return;
    }
    if (parsedQty <= 0) {
      alert("Please enter a valid quantity (Qty > 0) for " + activeItem.name + " before adding it to the sale.");
      return;
    }

    const isSqmProduct = activeItem.unit === "sqm";
    const sqmVal = isSqmProduct ? parsedQty : null;
    const pcsVal = isSqmProduct 
      ? (activeItem.pcs_per_sqm ? Math.round(parsedQty * activeItem.pcs_per_sqm) : parsedQty)
      : parsedQty;

    const newSubProduct = {
      subId: "sub-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      itemId: activeItem.id,
      itemName: activeItem.name,
      category: activeItem.category,
      color: selectedColor,
      size: Ua(activeItem),
      unit: activeItem.unit,
      sellingUnit: activePricelist.unitLabel,
      pcsPerSqm: activeItem.pcs_per_sqm,
      pricelistPrice: activePricelist.defaultPrice,
      sellingPrice: effectiveUnitPrice,
      qty: parsedQty,
      qtyPcs: pcsVal,
      sqm: sqmVal,
      totalAmount: activeTotalAmount,
      account: paymentAccount,
      unitVat: unitVatAmount,
      totalVat: totalVatAmount,
      discountDiff: discountDiff,
      discountPct: discountPct
    };

    // Point 2: First product is immediately placed into addedProducts list so it displays below the button
    setAddedProducts(prev => [...prev, newSubProduct]);

    // Reset current active selection into blank, ready to select next product
    setSelectedItemId("");
    setQuantityInput("");
    setSellingPriceInput("");
    setIsCustomPrice(false);
  };

  const handleEditSubProduct = (sub) => {
    setSelectedItemId(sub.itemId);
    setSelectedColor(sub.color || "Standard");
    setSellingPriceInput(String(sub.sellingPrice));
    setIsCustomPrice(true);
    setQuantityInput(String(sub.qty));
    setPaymentAccount(sub.account || "Cash");
    setAddedProducts(prev => prev.filter(p => p.subId !== sub.subId));
  };

  const handleRemoveSubProduct = (subId) => {
    setAddedProducts(prev => prev.filter(p => p.subId !== subId));
  };

  // Stage full sale into Daily Sales Ledger
  const handleAddSaleToLedger = () => {
    // Collect all items: addedProducts + active item if parsedQty > 0
    let itemsToStage = [...addedProducts];

    if (parsedQty > 0 && activeItem) {
      const isSqmProduct = activeItem.unit === "sqm";
      const sqmVal = isSqmProduct ? parsedQty : null;
      const pcsVal = isSqmProduct 
        ? (activeItem.pcs_per_sqm ? Math.round(parsedQty * activeItem.pcs_per_sqm) : parsedQty)
        : parsedQty;

      itemsToStage.push({
        subId: "sub-" + Date.now(),
        itemId: activeItem.id,
        itemName: activeItem.name,
        category: activeItem.category,
        color: selectedColor,
        size: Ua(activeItem),
        unit: activeItem.unit,
        sellingUnit: activePricelist.unitLabel,
        pcsPerSqm: activeItem.pcs_per_sqm,
        pricelistPrice: activePricelist.defaultPrice,
        sellingPrice: effectiveUnitPrice,
        qty: parsedQty,
        qtyPcs: pcsVal,
        sqm: sqmVal,
        totalAmount: activeTotalAmount,
        account: paymentAccount,
        unitVat: unitVatAmount,
        totalVat: totalVatAmount,
        discountDiff: discountDiff,
        discountPct: discountPct
      });
    }

    if (itemsToStage.length === 0) {
      alert("Please select a product and enter a quantity before staging to ledger.");
      return;
    }

    const totalPcs = itemsToStage.reduce((sum, it) => sum + (it.qtyPcs || it.qty), 0);
    const totalSqm = itemsToStage.reduce((sum, it) => sum + (it.sqm || 0), 0);
    const totalAmount = itemsToStage.reduce((sum, it) => sum + it.totalAmount, 0);

    const stagedSaleObj = {
      id: editingSaleId || ("staged-sale-" + Date.now()),
      customerName: customerName.trim() || "Walk-in Customer",
      customerContacts: customerContacts.trim() || "N/A",
      deliverySite: deliverySite.trim() || "Factory Collection",
      customerTin: customerTin.trim() || "N/A",
      date: saleDate,
      items: itemsToStage,
      totalPcs,
      totalSqm: Number(totalSqm.toFixed(2)),
      totalAmount
    };

    if (editingSaleId) {
      setStagedSales(prev => {
        const exists = prev.some(s => s.id === editingSaleId);
        if (exists) {
          return prev.map(s => s.id === editingSaleId ? stagedSaleObj : s);
        }
        return [stagedSaleObj, ...prev];
      });
      setEditingSaleId(null);
    } else {
      setStagedSales(prev => [stagedSaleObj, ...prev]);
    }

    // Reset customer and active fields
    setCustomerName("");
    setCustomerContacts("");
    setDeliverySite("");
    setCustomerTin("");
    setSelectedItemId("");
    setAddedProducts([]);
    setQuantityInput("");
    setSellingPriceInput("");
    setIsCustomPrice(false);
  };

  const handleCancelEdit = () => {
    setEditingSaleId(null);
    setCustomerName("");
    setCustomerContacts("");
    setDeliverySite("");
    setCustomerTin("");
    setSelectedItemId("");
    setAddedProducts([]);
    setQuantityInput("");
    setSellingPriceInput("");
    setIsCustomPrice(false);
  };

  const handleEditStagedSale = (sale) => {
    setEditingSaleId(sale.id);
    setCustomerName(sale.customerName);
    setCustomerContacts(sale.customerContacts);
    setDeliverySite(sale.deliverySite === "Factory Collection" ? "" : sale.deliverySite);
    setCustomerTin(sale.customerTin === "N/A" ? "" : sale.customerTin);
    setSaleDate(sale.date);

    if (sale.items && sale.items.length > 0) {
      const first = sale.items[0];
      setSelectedItemId(first.itemId);
      setSelectedColor(first.color || "Standard");
      setSellingPriceInput(first.sellingPrice ? String(first.sellingPrice) : "");
      setIsCustomPrice(true);
      setQuantityInput(String(first.qty));
      setPaymentAccount(first.account || "Cash");

      // Remaining items into addedProducts
      setAddedProducts(sale.items.slice(1));
    }
    // Scroll up smoothly so user can see and edit the fields
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {}
  };

  const handleDeleteStagedSale = (saleId) => {
    if (window.confirm("Remove this staged sale from the Daily Sales Ledger?")) {
      if (editingSaleId === saleId) {
        handleCancelEdit();
      }
      setStagedSales(prev => prev.filter(s => s.id !== saleId));
    }
  };

  // Open verification & confirmation popup modal (just like in production page)
  const handleOpenConfirmModal = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (stagedSales.length === 0) {
      if ((activeItem && parsedQty > 0) || addedProducts.length > 0) {
        handleAddSaleToLedger();
        setShowConfirmModal(true);
        return;
      }
      alert("No sales staged in the Daily Sales Ledger to confirm. Please select a product and click '+ Add Sale to Ledger'.");
      return;
    }
    setShowConfirmModal(true);
  };

  // Final Confirmation: Save & Deduct Stock from Inventory (Executed from confirmation modal)
  const handleExecuteDispatch = async () => {
    let salesToConfirm = [...stagedSales];

    if (salesToConfirm.length === 0) {
      setShowConfirmModal(false);
      return;
    }

    setIsSubmitting(true);
    const movementsToInsert = [];
    const dispatchBatchId = crypto.randomUUID ? crypto.randomUUID() : ("dispatch-" + Date.now());

    let grandTotalPcs = 0;
    let grandTotalSqm = 0;

    for (const sale of salesToConfirm) {
      for (const item of sale.items) {
        const catItem = a.find(it => it.id === item.itemId);
        if (!catItem) continue;

        const effectiveColor = item.color === "Standard" ? null : item.color;
        const isSqm = catItem.unit === "sqm";
        const deltaVal = isSqm && item.sqm !== null ? item.sqm : item.qtyPcs;
        const negativeDelta = -Math.abs(deltaVal);

        grandTotalPcs += (item.qtyPcs || item.qty);
        if (item.sqm) grandTotalSqm += item.sqm;

        movementsToInsert.push({
          item_id: catItem.id,
          type: "dispatch_out",
          color: effectiveColor,
          quantity_pcs: item.qtyPcs || item.qty,
          quantity_sqm: item.sqm,
          delta: negativeDelta,
          date: sale.date,
          note: \`Customer: \${sale.customerName} | Dest: \${sale.deliverySite} | TIN: \${sale.customerTin} | Acc: \${item.account}\`,
          batch_id: dispatchBatchId,
          price_per_unit: item.sellingPrice,
          total_price: item.totalAmount,
          customer_name: sale.customerName,
          customer_phone: sale.customerContacts,
          unit_sold_as: item.sellingUnit || catItem.unit
        });
      }
    }

    const success = await u(movementsToInsert);
    setIsSubmitting(false);

    if (success) {
      try {
        Ga({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ["#ef4444", "#f97316", "#3b82f6"] });
      } catch (err) {}

      setShowConfirmModal(false);

      setSuccessBanner({
        totalPcs: grandTotalPcs,
        totalSqm: Number(grandTotalSqm.toFixed(2)),
        saleCount: salesToConfirm.length,
        itemCount: movementsToInsert.length
      });

      // Clear draft storage after successful dispatch
      try {
        window._stumarcot_sales_draft = null;
        // in-memory cleared
      } catch (err) {}

      setStagedSales([]);
      setAddedProducts([]);
      setCustomerName("");
      setCustomerContacts("");
      setDeliverySite("");
      setCustomerTin("");
      setSelectedItemId("");
      setQuantityInput("");
      setSellingPriceInput("");
      setIsCustomPrice(false);
    }
  };

  return o.jsxs("div", {
    style: { display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px", margin: "0 auto", width: "100%" },
    children: [
      
      // Top Header
      o.jsxs("div", {
        style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" },
        children: [
          o.jsxs("div", {
            children: [
              o.jsx("h1", {
                style: { fontSize: "clamp(18px, 4vw, 22px)", fontWeight: 800, letterSpacing: "-0.02em", color: "#f8fafc", margin: 0 },
                children: "Sales / Dispatch (Deduct Stock)"
              }),
              o.jsx("p", {
                style: { fontSize: "12.5px", color: "var(--text-muted)", marginTop: "3px" },
                children: "Record outgoing customer dispatches & sales to deduct from inventory"
              })
            ]
          }),
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-surface-elevated)", padding: "6px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" },
            children: [
              o.jsx(ni, { size: 15, color: "#f87171" }),
              o.jsx("input", {
                type: "date",
                value: saleDate,
                onChange: e => setSaleDate(e.target.value),
                style: { background: "transparent", border: "none", color: "#f8fafc", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, outline: "none" }
              })
            ]
          })
        ]
      }),

      // Success Notification Card
      successBanner && o.jsxs("div", {
        className: "card",
        style: { background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(15, 23, 42, 0.95))", borderColor: "rgba(239, 68, 68, 0.4)", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" },
        children: [
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: "10px" },
            children: [
              o.jsx(pn, { size: 24, color: "#ef4444" }),
              o.jsxs("div", {
                children: [
                  o.jsx("div", { style: { fontWeight: 700, fontSize: "14px", color: "#f87171" }, children: "Sales Dispatch Recorded! Stock Deducted." }),
                  o.jsxs("div", { style: { fontSize: "12px", color: "var(--text-secondary)" }, children: ["Deducted -", successBanner.totalPcs.toLocaleString(), " pcs ", successBanner.totalSqm > 0 ? "(-" + successBanner.totalSqm + " m²)" : "", " across ", successBanner.saleCount, " sales (", successBanner.itemCount, " items)."] })
                ]
              })
            ]
          }),
          o.jsx("button", {
            onClick: () => setSuccessBanner(null),
            className: "btn btn-ghost btn-sm",
            style: { color: "var(--text-muted)" },
            children: "✕"
          })
        ]
      }),

      // Card 1: Customer Details (Sticky Across Multiple Products)
      o.jsx("div", {
        className: "card",
        style: { padding: "16px", background: "var(--bg-surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)" },
        children: o.jsxs("div", {
          style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" },
          children: [
            // Field 1: Customer Name
            o.jsxs("div", {
              children: [
                o.jsx("label", { style: { fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }, children: "Customer / Buyer Name (Optional)" }),
                o.jsx("input", {
                  type: "text",
                  className: "input-field",
                  placeholder: "e.g. Salim Ali, Techno Construction...",
                  value: customerName,
                  onChange: e => setCustomerName(e.target.value),
                  style: { fontSize: "13.5px" }
                })
              ]
            }),

            // Field 2: Contacts with Point 1 Tanzanian Phone Validation
            o.jsxs("div", {
              children: [
                o.jsxs("label", { style: { fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }, children: [
                  o.jsx("span", { children: "Contacts / Phone (Optional)" }),
                  customerContacts.trim().length > 0 && (
                    isPhoneValid 
                      ? o.jsx("span", { style: { color: "#34d399", fontSize: "11px", fontWeight: 700 }, children: "✓ Valid TZ Phone" })
                      : o.jsx("span", { style: { color: "var(--text-muted)", fontSize: "11px" }, children: "07... / 06... recommended" })
                  )
                ]}),
                o.jsx("input", {
                  type: "tel",
                  className: "input-field mono",
                  placeholder: "e.g. 0712 345 678 or +255 712 345 678",
                  value: customerContacts,
                  onChange: e => setCustomerContacts(e.target.value),
                  style: {
                    fontSize: "13.5px",
                    borderColor: customerContacts.trim().length > 0 ? (isPhoneValid ? "#10b981" : "var(--border-subtle)") : "var(--border-subtle)"
                  }
                })
              ]
            }),

            // Field 3: Delivery Site
            o.jsxs("div", {
              children: [
                o.jsx("label", { style: { fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }, children: "Delivery Site / Truck Plate (Optional)" }),
                o.jsx("input", {
                  type: "text",
                  className: "input-field",
                  placeholder: "e.g. Mikocheni Site, Truck T832...",
                  value: deliverySite,
                  onChange: e => setDeliverySite(e.target.value),
                  style: { fontSize: "13.5px" }
                })
              ]
            }),

            // Field 4: TIN NO
            o.jsxs("div", {
              children: [
                o.jsx("label", { style: { fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }, children: "TIN NO" }),
                o.jsx("input", {
                  type: "text",
                  className: "input-field",
                  placeholder: "e.g. 123-456-789...",
                  value: customerTin,
                  onChange: e => setCustomerTin(e.target.value),
                  style: { fontSize: "13.5px" }
                })
              ]
            })
          ]
        })
      }),

      // Card 2: Sales (Product Details & Money Details)
      o.jsxs("div", {
        className: "card",
        style: {
          padding: "18px",
          background: "var(--bg-surface-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        },
        children: [
          // Header of Card 2
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" },
            children: [
              o.jsx("h2", { style: { fontSize: "18px", fontWeight: 800, color: "#f8fafc", margin: 0 }, children: "Sales" }),
              o.jsx("span", { style: { fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }, children: "Primary Product (High-Velocity Tracked)" })
            ]
          }),

          // Form Area: Product hero, Money & Quantity inputs, Add Product button & Subcards
          o.jsxs("div", {
            style: { display: "flex", flexDirection: "column", gap: "16px" },
            children: [
                // Product Hero Banner: Always visible with either active product or "Select Product" prompt
                o.jsxs("div", {
                  style: { background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" },
                  children: [
                    // Left: Change/Select Product Button & Color Picker
                    o.jsxs("div", {
                      style: { display: "flex", flexDirection: "column", gap: "8px", minWidth: "150px" },
                      children: [
                        o.jsxs("button", {
                          type: "button",
                          onClick: () => setShowProductModal(true),
                          className: activeItem ? "btn btn-secondary btn-sm" : "btn btn-primary btn-sm",
                          style: { background: activeItem ? "var(--bg-input)" : undefined, border: "1px solid var(--border-subtle)", color: "#f8fafc", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", width: "160px" },
                          children: [
                            o.jsx("span", { children: activeItem ? "Change Product" : "Select Product" }),
                            o.jsx(activeItem ? wc : vr, { size: 14, color: activeItem ? "var(--text-muted)" : "#ffffff" })
                          ]
                        }),
                        activeItem && activeItem.colors && activeItem.colors.length > 0 && o.jsxs("div", {
                          style: { position: "relative" },
                          children: [
                            o.jsxs("button", {
                              type: "button",
                              onClick: () => setShowColorDropdown(!showColorDropdown),
                              className: "btn btn-secondary btn-sm",
                              style: { background: "var(--bg-input)", border: "1px solid var(--border-subtle)", color: "#f8fafc", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", width: "160px" },
                              children: [
                                o.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                                  o.jsx("span", { style: { color: "var(--text-secondary)" }, children: "Color:" }),
                                  o.jsx(xr, { color: selectedColor, showCount: false }),
                                  o.jsx("strong", { children: selectedColor })
                                ]}),
                                o.jsx(wc, { size: 12, color: "var(--text-muted)" })
                              ]
                            }),
                            showColorDropdown && o.jsx("div", {
                              style: { position: "absolute", top: "100%", left: 0, marginTop: "4px", width: "160px", background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", zIndex: 30, padding: "4px" },
                              children: activeItem.colors.map(col => o.jsxs("button", {
                                key: col,
                                type: "button",
                                onClick: () => handleSelectColor(col),
                                style: { display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "6px 10px", background: selectedColor === col ? "rgba(249,115,22,0.15)" : "transparent", border: "none", borderRadius: "6px", color: "#f8fafc", fontSize: "12px", cursor: "pointer", textAlign: "left" },
                                children: [
                                  o.jsx(xr, { color: col, showCount: false }),
                                  o.jsx("span", { children: col })
                                ]
                              }))
                            })
                          ]
                        })
                      ]
                    }),

                    // Center: Product Name, Category & Specs
                    o.jsxs("div", {
                      style: { textAlign: "center", flex: 1, minWidth: "180px" },
                      children: [
                        o.jsx("div", { style: { fontSize: "11px", fontWeight: 700, color: "var(--brand-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }, children: activeItem ? activeItem.category : "PRODUCT CATALOG" }),
                        o.jsxs("div", {
                          style: { display: "inline-flex", alignItems: "center", gap: "8px" },
                          children: [
                            o.jsx("span", { style: { fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }, children: activeItem ? activeItem.name : "Select a Product to Sell" }),
                            activeItem && selectedColor && selectedColor !== "Standard" && o.jsxs("span", {
                              className: "badge",
                              style: { background: "rgba(255,255,255,0.08)", border: "1px solid var(--border-subtle)", color: "#f8fafc", fontSize: "11px", padding: "2px 8px" },
                              children: [o.jsx(xr, { color: selectedColor, showCount: false }), selectedColor]
                            })
                          ]
                        }),
                        o.jsx("div", { style: { fontSize: "12px", fontWeight: 600, color: "var(--brand-400)", marginTop: "2px" }, children: activeItem ? (activeItem.unit === "sqm" && activeItem.pcs_per_sqm ? activeItem.pcs_per_sqm + " pcs/sqm" : (Ua(activeItem) || activeItem.unit)) : "Click 'Select Product' button to choose item" })
                      ]
                    }),

                    // Right: Stock & Accurate Pricelist Indicator
                    o.jsxs("div", {
                      style: { textAlign: "right", minWidth: "180px", display: "flex", flexDirection: "column", gap: "6px" },
                      children: [
                        o.jsxs("div", {
                          style: { fontSize: "12px", color: "var(--text-secondary)" },
                          children: [
                            "Current In Stock: ",
                            o.jsx("strong", { style: { color: "#f8fafc" }, children: activeItem ? (activeStock ? activeStock.total_pcs + " pcs" : "0 pcs") : "—" }),
                            activeStock && activeStock.total_sqm !== null && o.jsxs("span", { style: { color: "var(--brand-400)", marginLeft: "4px" }, children: ["(", activeStock.total_sqm, " m²)"] })
                          ]
                        }),
                        o.jsxs("div", {
                          style: { display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" },
                          children: [
                            o.jsxs("span", { style: { fontSize: "12px", fontWeight: 700, color: "#f8fafc" }, children: ["Unit price :"] }),
                            o.jsx("div", {
                              style: { background: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "4px 10px", fontSize: "12.5px", fontFamily: "var(--font-mono)", color: "var(--brand-400)", fontWeight: 700 },
                              children: activeItem && activePricelist.defaultPrice > 0 ? formatMoney(activePricelist.defaultPrice) + " Tsh/" + activePricelist.unitLabel : "price as per pricelist"
                            })
                          ]
                        })
                      ]
                    })
                  ]
                }),

                // Inputs Layout: Exact User Specification
                // At Top: 3 things (selling price, qty, account)
                // Below: 2 things (total amount, vat section)
                o.jsxs("div", {
                  style: { display: "flex", flexDirection: "column", gap: "16px" },
                  children: [
                    // Top Row: 3 things (Selling price, Qty, Account)
                    o.jsxs("div", {
                      style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", alignItems: "start" },
                      children: [
                        // 1. Selling price
                        o.jsxs("div", {
                          children: [
                            o.jsxs("label", { style: { fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }, children: [
                              o.jsxs("span", { children: ["Selling price", activePricelist.unitLabel ? " (per " + activePricelist.unitLabel + ")" : ""] }),
                              isCustomPrice && o.jsx("button", {
                                type: "button",
                                onClick: () => { setIsCustomPrice(false); setSellingPriceInput(""); },
                                style: { background: "none", border: "none", color: "var(--brand-400)", fontSize: "11px", cursor: "pointer", textDecoration: "underline" },
                                children: "Reset to pricelist"
                              })
                            ]}),
                            o.jsx("input", {
                              type: "number",
                              className: "input-field mono",
                              placeholder: activePricelist.defaultPrice > 0 ? String(activePricelist.defaultPrice) : "Unit price as per pricelist",
                              value: isCustomPrice ? sellingPriceInput : (activePricelist.defaultPrice > 0 ? activePricelist.defaultPrice : ""),
                              onChange: e => {
                                setIsCustomPrice(true);
                                setSellingPriceInput(e.target.value);
                              },
                              style: { fontSize: "15px", fontWeight: 700, color: "#f8fafc" }
                            })
                          ]
                        }),

                        // 2. Qty
                        o.jsxs("div", {
                          children: [
                            o.jsxs("label", { style: { fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }, children: [
                              o.jsxs("span", { children: ["Qty", activePricelist.unitLabel ? " (" + activePricelist.unitLabel + ")" : ""] }),
                              parsedQty > 0 && activePricelist.isSqm && activeItem && activeItem.pcs_per_sqm && o.jsxs("span", { style: { color: "var(--brand-400)", fontSize: "11px" }, children: ["≈ ", Math.round(parsedQty * activeItem.pcs_per_sqm), " pcs"] })
                            ]}),
                            o.jsx("input", {
                              type: "number",
                              min: "0",
                              step: "any",
                              className: "input-field mono",
                              placeholder: activePricelist.isSqm ? "Qty in m²..." : "Qty in pcs...",
                              value: quantityInput,
                              onChange: e => setQuantityInput(e.target.value),
                              style: { fontSize: "16px", fontWeight: 700, color: "#f8fafc" }
                            })
                          ]
                        }),

                        // 3. Account
                        o.jsxs("div", {
                          children: [
                            o.jsx("label", { style: { fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }, children: "Account" }),
                            o.jsxs("select", {
                              className: "input-field",
                              value: paymentAccount,
                              onChange: e => setPaymentAccount(e.target.value),
                              style: { fontSize: "13.5px", fontWeight: 600, color: "#f8fafc", cursor: "pointer", height: "46px" },
                              children: [
                                o.jsx("option", { value: "Cash", children: "Cash" }),
                                o.jsx("option", { value: "CRDB Bank", children: "CRDB Bank" }),
                                o.jsx("option", { value: "NMB Bank", children: "NMB Bank" }),
                                o.jsx("option", { value: "M-Pesa", children: "M-Pesa" }),
                                o.jsx("option", { value: "Airtel Money", children: "Airtel Money" }),
                                o.jsx("option", { value: "Tigo Pesa", children: "Tigo Pesa" }),
                                o.jsx("option", { value: "Credit / Invoice", children: "Credit / Invoice" })
                              ]
                            })
                          ]
                        })
                      ]
                    }),

                    // Below: 2 things (Total amount, VAT section)
                    o.jsxs("div", {
                      style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", alignItems: "end" },
                      children: [
                        // 1. Total Amount
                        o.jsxs("div", {
                          children: [
                            o.jsx("label", { style: { fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }, children: "Total Amount" }),
                            o.jsx("input", {
                              type: "text",
                              readOnly: true,
                              className: "input-field mono",
                              value: activeTotalAmount > 0 ? formatMoney(activeTotalAmount) + " Tsh" : "",
                              placeholder: "0 Tsh",
                              style: { fontSize: "16px", fontWeight: 800, color: "#f8fafc", background: "var(--bg-input)", border: "1px solid var(--border-subtle)", cursor: "default", height: "46px" }
                            })
                          ]
                        }),

                        // 2. VAT section (heading removed since section shows VAT or discount)
                        o.jsx("div", {
                          children: [
                            o.jsx("div", {
                              style: {
                                background: "var(--bg-surface-elevated)",
                                border: discountDiff > 0 ? "1px solid rgba(234, 179, 8, 0.3)" : "1px solid var(--border-subtle)",
                                borderRadius: "var(--radius-md)",
                                padding: "6px 14px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: "8px",
                                minHeight: "46px",
                                boxSizing: "border-box"
                              },
                              children: discountDiff > 0 ? o.jsxs(o.Fragment, {
                                children: [
                                  o.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                                    o.jsx("span", { style: { fontSize: "13px" }, children: "🏷️" }),
                                    o.jsxs("span", { style: { fontSize: "12px", fontWeight: 700, color: "#eab308" }, children: ["Discount: -Tsh ", formatMoney(discountDiff), "/", activePricelist.unitLabel, " (", discountPct.toFixed(1), "%)"] })
                                  ]}),
                                  o.jsxs("div", { style: { fontSize: "11.5px", color: "var(--text-secondary)" }, children: [
                                    "Total Saved: ",
                                    o.jsx("strong", { style: { color: "#eab308" }, children: ["Tsh ", formatMoney(discountDiff * parsedQty)] })
                                  ]})
                                ]
                              }) : discountDiff < 0 ? o.jsxs(o.Fragment, {
                                children: [
                                  o.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                                    o.jsx("span", { style: { fontSize: "13px" }, children: "📈" }),
                                    o.jsxs("span", { style: { fontSize: "12px", fontWeight: 700, color: "var(--brand-400)" }, children: ["Above List: +Tsh ", formatMoney(Math.abs(discountDiff)), "/", activePricelist.unitLabel] })
                                  ]}),
                                  o.jsxs("div", { style: { fontSize: "11.5px", color: "var(--text-secondary)" }, children: [
                                    "Total Premium: ",
                                    o.jsx("strong", { style: { color: "var(--brand-400)" }, children: ["Tsh ", formatMoney(Math.abs(discountDiff) * parsedQty)] })
                                  ]})
                                ]
                              }) : o.jsxs(o.Fragment, {
                                children: [
                                  o.jsxs("div", {
                                    style: { display: "flex", alignItems: "center", gap: "6px" },
                                    children: [
                                      o.jsx("span", { style: { fontSize: "13px" }, children: "🧾" }),
                                      o.jsxs("div", {
                                        style: { display: "flex", flexDirection: "column", lineHeight: 1.15 },
                                        children: [
                                          o.jsxs("span", { style: { fontSize: "12px", fontWeight: 700, color: "#f8fafc" }, children: ["VAT : Tsh ", formatMoney(unitVatAmount), activePricelist.unitLabel ? "/" + activePricelist.unitLabel : ""] }),
                                          o.jsx("span", { style: { fontSize: "9.5px", color: "var(--text-muted)", fontWeight: 500 }, children: "18%" })
                                        ]
                                      })
                                    ]
                                  }),
                                  o.jsxs("div", { style: { fontSize: "11.5px", color: "var(--text-secondary)" }, children: [
                                    "Total VAT: ",
                                    o.jsx("strong", { style: { color: "#f8fafc" }, children: ["Tsh ", formatMoney(totalVatAmount)] })
                                  ]})
                                ]
                              })
                            })
                          ]
                        })
                      ]
                    })
                  ]
                }),

                // Button: Add Another Product to Sale
                o.jsxs("button", {
                  type: "button",
                  onClick: handleAddAnotherProduct,
                  className: "btn btn-secondary",
                  style: { borderStyle: "dashed", borderColor: "rgba(249, 115, 22, 0.45)", color: "var(--brand-400)", width: "100%", minHeight: "44px", fontWeight: 700 },
                  children: [
                    o.jsx(vr, { size: 16 }),
                    o.jsx("span", { children: "+ Add Another Product to Sale" })
                  ]
                }),

                // Subcard list: auto-summarized products added to this customer sale
                // ALWAYS visible right below the "+ Add Another Product to Sale" button!
                // Appears immediately when product is added, before selecting another product.
                addedProducts.length > 0 && o.jsxs("div", {
                  style: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" },
                  children: [
                    o.jsxs("div", {
                      style: { fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "space-between" },
                      children: [
                        o.jsxs("span", { children: ["Items in this Customer Sale (", addedProducts.length, ")"] }),
                        o.jsxs("span", { style: { color: "#f8fafc", fontWeight: 800 }, children: ["Subtotal: ", formatMoney(addedProducts.reduce((sum, p) => sum + p.totalAmount, 0)), " Tsh"] })
                      ]
                    }),
                    addedProducts.map((sub, idx) => o.jsxs("div", {
                      key: sub.subId,
                      style: { background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" },
                      children: [
                        o.jsxs("div", {
                          style: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1 },
                          children: [
                            o.jsxs("span", { style: { fontWeight: 800, fontSize: "11.5px", color: "var(--brand-400)" }, children: ["#", idx + 1] }),
                            o.jsxs("strong", { style: { fontSize: "13.5px", color: "#f8fafc" }, children: [sub.itemName, sub.color && sub.color !== "Standard" ? " (" + sub.color + ")" : ""] }),
                            o.jsxs("span", { style: { fontSize: "12px", color: "#f8fafc", fontWeight: 700, fontFamily: "var(--font-mono)" }, children: [sub.qty, " ", sub.sellingUnit, sub.qtyPcs && sub.sellingUnit === "m²" ? " (" + sub.qtyPcs + " pcs)" : ""] }),
                            o.jsxs("span", { style: { fontSize: "12px", color: "var(--text-secondary)" }, children: ["@", formatMoney(sub.sellingPrice), " Tsh"] }),
                            o.jsxs("span", { style: { fontSize: "12.5px", fontWeight: 700, color: "#f8fafc" }, children: ["= ", formatMoney(sub.totalAmount), " Tsh"] }),
                            o.jsx("span", { className: "badge badge-neutral", style: { fontSize: "10px", padding: "1px 6px" }, children: sub.account })
                          ]
                        }),
                        o.jsxs("div", {
                          style: { display: "flex", alignItems: "center", gap: "4px" },
                          children: [
                            o.jsx("button", {
                              type: "button",
                              onClick: () => handleEditSubProduct(sub),
                              className: "btn-ghost",
                              style: { padding: "4px 6px", color: "var(--brand-400)", cursor: "pointer", border: "none", background: "none", fontSize: "12px" },
                              title: "Edit item",
                              children: "✏️"
                            }),
                            o.jsx("button", {
                              type: "button",
                              onClick: () => handleRemoveSubProduct(sub.subId),
                              className: "btn-ghost",
                              style: { padding: "4px 6px", color: "#f87171", cursor: "pointer", border: "none", background: "none", fontSize: "13px" },
                              title: "Remove item",
                              children: "✕"
                            })
                          ]
                        })
                      ]
                    }))
                  ]
                })
              ]
            })
          ]
        }),
      // Action Button: Add Sale to Ledger / Update Staged Sale
      editingSaleId ? o.jsxs("div", {
        style: { display: "flex", gap: "10px", width: "100%" },
        children: [
          o.jsxs("button", {
            type: "button",
            onClick: handleAddSaleToLedger,
            disabled: (!activeItem && addedProducts.length === 0) || (activeItem && parsedQty <= 0 && addedProducts.length === 0),
            className: "btn",
            style: {
              flex: 1,
              minHeight: "48px",
              background: "rgba(249, 115, 22, 0.15)",
              border: "1px solid var(--brand-500)",
              color: "var(--brand-400)",
              fontSize: "14.5px",
              fontWeight: 700,
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            },
            children: [
              o.jsx(vr, { size: 18 }),
              o.jsx("span", { children: "Update Staged Sale in Ledger" })
            ]
          }),
          o.jsx("button", {
            type: "button",
            onClick: handleCancelEdit,
            className: "btn btn-secondary",
            style: {
              minHeight: "48px",
              padding: "0 18px",
              fontSize: "13.5px",
              fontWeight: 600,
              borderRadius: "var(--radius-md)",
              cursor: "pointer"
            },
            children: "Cancel Edit"
          })
        ]
      }) : o.jsxs("button", {
        type: "button",
        onClick: handleAddSaleToLedger,
        disabled: (!activeItem && addedProducts.length === 0) || (activeItem && parsedQty <= 0 && addedProducts.length === 0),
        className: "btn",
        style: {
          width: "100%",
          minHeight: "48px",
          background: ((activeItem && parsedQty > 0) || addedProducts.length > 0) ? "rgba(249, 115, 22, 0.15)" : "rgba(255,255,255,0.03)",
          border: ((activeItem && parsedQty > 0) || addedProducts.length > 0) ? "1px dashed var(--brand-500)" : "1px dashed var(--border-subtle)",
          color: ((activeItem && parsedQty > 0) || addedProducts.length > 0) ? "var(--brand-400)" : "var(--text-muted)",
          fontSize: "14.5px",
          fontWeight: 700,
          borderRadius: "var(--radius-md)",
          cursor: ((activeItem && parsedQty > 0) || addedProducts.length > 0) ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px"
        },
        children: [
          o.jsx(vr, { size: 18 }),
          o.jsx("span", { children: "+ Add Sale to Ledger" })
        ]
      }),

      // Card 3: Daily Sales Ledger
      o.jsxs("div", {
        className: "card",
        style: { padding: "18px", background: "var(--bg-surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "12px" },
        children: [
          o.jsxs("div", {
            style: { display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" },
            children: [
              o.jsxs("div", {
                style: { display: "flex", alignItems: "center", gap: "8px" },
                children: [
                  o.jsx("h2", { style: { fontSize: "17px", fontWeight: 800, color: "#f8fafc", margin: 0 }, children: "Daily Sales Ledger" }),
                  o.jsxs("span", {
                    className: "badge",
                    style: { background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)", color: stagedSales.length > 0 ? "var(--brand-400)" : "var(--text-muted)", fontSize: "11px", fontWeight: 700 },
                    children: [stagedSales.length, " Sales Staged"]
                  })
                ]
              }),
              o.jsx("span", { style: { fontSize: "11.5px", color: "var(--text-muted)" }, children: "Review & confirm sales dispatches" })
            ]
          }),

          // Ledger Table / Cards (3 Columns Layout as specified)
          stagedSales.length === 0 ? o.jsx("div", {
            style: { padding: "24px 16px", textAlign: "center", background: "rgba(0, 0, 0, 0.2)", borderRadius: "8px", border: "1px dashed var(--border-subtle)", color: "var(--text-muted)", fontSize: "12.5px" },
            children: 'No sales staged in the ledger yet. Fill customer & product details above and click "+ Add Sale to Ledger".'
          }) : o.jsx("div", {
            style: { display: "flex", flexDirection: "column", gap: "10px" },
            children: stagedSales.map(sale => {
              const isSingleItem = sale.items.length === 1;

              return o.jsxs("div", {
                key: sale.id,
                style: {
                  background: editingSaleId === sale.id ? "rgba(249, 115, 22, 0.12)" : "var(--bg-surface-elevated)",
                  border: editingSaleId === sale.id ? "1px solid var(--brand-500)" : "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: isSingleItem ? "10px 14px" : "12px 14px",
                  display: "grid",
                  gridTemplateColumns: "minmax(170px, 1.1fr) minmax(210px, 1.8fr) minmax(170px, 1.1fr) auto",
                  alignItems: "center",
                  gap: "14px",
                  transition: "border-color 0.15s ease"
                },
                children: [
                  
                  // Left Side: Customer Details
                  // Single line for 1 product; 3 lines for multiple products
                  isSingleItem ? o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", fontSize: "12.5px" },
                    children: [
                      o.jsxs("strong", { style: { color: "#f8fafc", display: "inline-flex", alignItems: "center", gap: "4px" }, children: [
                        o.jsx("span", { children: "👤" }),
                        sale.customerName,
                        editingSaleId === sale.id && o.jsx("span", { className: "badge", style: { background: "rgba(249, 115, 22, 0.2)", color: "var(--brand-400)", border: "1px solid var(--brand-500)", fontSize: "10px", padding: "1px 6px", fontWeight: 700, marginLeft: "4px" }, children: "Editing" })
                      ]}),
                      o.jsxs("span", { style: { color: "var(--text-secondary)" }, children: ["· 📞 ", sale.customerContacts] }),
                      sale.deliverySite && sale.deliverySite !== "Factory Collection" && o.jsxs("span", { style: { color: "var(--text-muted)" }, children: ["· 📍 ", sale.deliverySite] })
                    ]
                  }) : o.jsxs("div", {
                    style: { display: "flex", flexDirection: "column", gap: "2px" },
                    children: [
                      o.jsxs("strong", { style: { fontSize: "13px", color: "#f8fafc", display: "inline-flex", alignItems: "center", gap: "4px" }, children: [
                        o.jsx("span", { children: "👤" }),
                        sale.customerName,
                        editingSaleId === sale.id && o.jsx("span", { className: "badge", style: { background: "rgba(249, 115, 22, 0.2)", color: "var(--brand-400)", border: "1px solid var(--brand-500)", fontSize: "10px", padding: "1px 6px", fontWeight: 700, marginLeft: "4px" }, children: "Editing" })
                      ]}),
                      o.jsxs("div", { style: { fontSize: "11px", color: "var(--text-secondary)" }, children: [
                        "📞 ", sale.customerContacts, sale.customerTin && sale.customerTin !== "N/A" ? " · TIN: " + sale.customerTin : ""
                      ]}),
                      o.jsxs("div", { style: { fontSize: "11px", color: "var(--text-muted)" }, children: [
                        "📍 ", sale.deliverySite || "Factory Collection"
                      ]})
                    ]
                  }),

                  // Middle: Product Details
                  // Single line for 1 product; Listed line-by-line in small fonts for multiple products
                  isSingleItem ? o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", fontSize: "12.5px" },
                    children: [
                      o.jsxs("strong", { style: { color: "var(--brand-400)", display: "inline-flex", alignItems: "center", gap: "4px" }, children: [
                        o.jsx("span", { children: "📦" }),
                        sale.items[0].itemName,
                        sale.items[0].color && sale.items[0].color !== "Standard" ? " (" + sale.items[0].color + ")" : ""
                      ]}),
                      sale.items[0].size && o.jsxs("span", { style: { color: "var(--text-muted)", fontSize: "11.5px" }, children: ["· 📐 ", sale.items[0].size] }),
                      o.jsxs("span", { style: { color: "#f8fafc", fontWeight: 700, fontFamily: "var(--font-mono)" }, children: [
                        "· 🔢 ", sale.totalPcs.toLocaleString(), " pcs",
                        sale.totalSqm > 0 ? " (" + sale.totalSqm + " m²)" : ""
                      ]})
                    ]
                  }) : o.jsx("div", {
                    style: { display: "flex", flexDirection: "column", gap: "3px" },
                    children: sale.items.map((it, idx) => o.jsxs("div", {
                      key: it.subId || idx,
                      style: { fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px", lineHeight: "1.3" },
                      children: [
                        o.jsxs("span", { style: { fontWeight: 700, color: "var(--brand-400)" }, children: [idx + 1, "."] }),
                        o.jsxs("strong", { style: { color: "#f8fafc" }, children: [
                          it.itemName,
                          it.color && it.color !== "Standard" ? " (" + it.color + ")" : ""
                        ]}),
                        o.jsx("span", { style: { color: "var(--text-muted)" }, children: "—" }),
                        o.jsxs("span", { style: { color: "#f8fafc", fontWeight: 600, fontFamily: "var(--font-mono)" }, children: [
                          it.qty, " ", it.sellingUnit,
                          it.qtyPcs && it.sellingUnit === "m²" ? " (" + it.qtyPcs + " pcs)" : ""
                        ]})
                      ]
                    }))
                  }),

                  // Right Side: Amount and Total Amount
                  // Single line for 1 product; 3 lines for multiple products
                  isSingleItem ? o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", fontSize: "12.5px" },
                    children: [
                      o.jsxs("span", { style: { color: "var(--text-secondary)", fontSize: "12px" }, children: ["@", formatMoney(sale.items[0].sellingPrice), " Tsh"] }),
                      o.jsxs("strong", { style: { color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: ["Total: ", formatMoney(sale.totalAmount), " Tsh"] }),
                      o.jsx("span", { className: "badge badge-neutral", style: { fontSize: "10px", padding: "1px 6px" }, children: sale.items[0].account || "Cash" })
                    ]
                  }) : o.jsxs("div", {
                    style: { display: "flex", flexDirection: "column", gap: "2px" },
                    children: [
                      o.jsxs("div", { style: { fontSize: "11px", color: "var(--text-secondary)" }, children: [
                        "📦 ", sale.items.length, " items (", sale.totalPcs.toLocaleString(), " pcs)"
                      ]}),
                      o.jsxs("div", { style: { fontSize: "13.5px", fontWeight: 800, color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: [
                        "Total: ", formatMoney(sale.totalAmount), " Tsh"
                      ]}),
                      o.jsxs("div", { style: { fontSize: "11px", color: "var(--brand-400)", fontWeight: 600 }, children: [
                        "🏦 ", sale.items[0].account || "Cash"
                      ]})
                    ]
                  }),

                  // Action Icons (View Details, Edit, Delete)
                  o.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "4px" },
                    children: [
                      o.jsx("button", {
                        type: "button",
                        onClick: () => setViewSaleDetail(sale),
                        className: "btn-ghost",
                        style: { padding: "6px", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer", background: "none", border: "none" },
                        title: "View Details",
                        children: "👁️"
                      }),
                      o.jsx("button", {
                        type: "button",
                        onClick: () => handleEditStagedSale(sale),
                        className: "btn-ghost",
                        style: { padding: "6px", color: "var(--brand-400)", fontSize: "13px", cursor: "pointer", background: "none", border: "none" },
                        title: "Edit Sale",
                        children: "✏️"
                      }),
                      o.jsx("button", {
                        type: "button",
                        onClick: () => handleDeleteStagedSale(sale.id),
                        className: "btn-ghost",
                        style: { padding: "6px", color: "#f87171", fontSize: "13px", cursor: "pointer", background: "none", border: "none" },
                        title: "Delete Sale",
                        children: "🗑️"
                      })
                    ]
                  })
                ]
              });
            })
          })
        ]
      }),

      // Bottom CTA: Confirm Sales Dispatch (Deduct Stock)
      // Refactored: Only show total sale in Tsh, bolded large
      o.jsxs("div", {
        className: "card-elevated",
        style: { position: "sticky", bottom: "calc(var(--nav-bottom-height) + 10px)", zIndex: 30, padding: "14px 18px", background: "rgba(15, 23, 42, 0.96)", backdropFilter: "blur(12px)", border: "1px solid rgba(239, 68, 68, 0.4)", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.8)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" },
        children: [
          o.jsxs("div", {
            style: { display: "flex", flexDirection: "column" },
            children: [
              o.jsx("span", { style: { fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "2px" }, children: "Total Sale" }),
              o.jsxs("div", {
                style: { fontSize: "24px", fontWeight: 900, color: "#f8fafc", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" },
                children: [
                  formatMoney(totalSalesRevenue),
                  o.jsx("span", { style: { fontSize: "14.5px", fontWeight: 700, color: "var(--brand-400)", marginLeft: "6px" }, children: "Tsh" })
                ]
              })
            ]
          }),
          o.jsx("button", {
            type: "button",
            onClick: handleOpenConfirmModal,
            disabled: isSubmitting || (stagedSales.length === 0 && parsedQty <= 0 && addedProducts.length === 0),
            className: "btn btn-primary btn-lg",
            style: { background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)", minWidth: "240px" },
            children: isSubmitting ? "Recording Dispatch..." : o.jsxs(o.Fragment, {
              children: [
                o.jsx(Vp, { size: 18 }),
                o.jsx("span", { children: "↘ Confirm Sales Dispatch" })
              ]
            })
          })
        ]
      }),

      // Product Selection Modal
      showProductModal && o.jsx("div", {
        className: "modal-overlay",
        onClick: () => setShowProductModal(false),
        children: o.jsxs("div", {
          className: "modal-content",
          onClick: e => e.stopPropagation(),
          style: { padding: "20px", maxHeight: "85vh", display: "flex", flexDirection: "column" },
          children: [
            o.jsxs("div", {
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsx("h3", { style: { fontSize: "17px", fontWeight: 700 }, children: "Select Product to Sell" }),
                    o.jsx("p", { style: { fontSize: "11.5px", color: "var(--brand-400)" }, children: "Ordered by highest volume sales velocity" })
                  ]
                }),
                o.jsx("button", {
                  type: "button",
                  onClick: () => setShowProductModal(false),
                  className: "btn btn-ghost btn-sm",
                  children: o.jsx(Yn, { size: 18 })
                })
              ]
            }),
            o.jsxs("div", {
              className: "search-wrapper",
              style: { marginBottom: "10px" },
              children: [
                o.jsx(ii, { className: "search-icon", size: 18 }),
                o.jsx("input", {
                  type: "text",
                  className: "input-field search-input",
                  placeholder: "Filter product name...",
                  value: productSearch,
                  onChange: e => setProductSearch(e.target.value),
                  autoFocus: true
                })
              ]
            }),
            o.jsx("div", {
              className: "filter-tabs",
              style: { marginBottom: "12px" },
              children: categoriesList.map(cat => o.jsx("button", {
                key: cat,
                type: "button",
                onClick: () => setProductCategoryFilter(cat),
                className: "filter-tab " + (productCategoryFilter === cat ? "active" : ""),
                style: { padding: "6px 12px", fontSize: "12px" },
                children: cat
              }))
            }),
            o.jsx("div", {
              style: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" },
              children: filteredModalProducts.map((it, idx) => {
                const itStock = d(it.id);
                const itPrice = getItemPricelist(it, "White");
                return o.jsxs("button", {
                  key: it.id,
                  type: "button",
                  onClick: () => {
                    setSelectedItemId(it.id);
                    setIsCustomPrice(false);
                    setSellingPriceInput("");
                    setShowProductModal(false);
                  },
                  style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: selectedItemId === it.id ? "rgba(249,115,22,0.15)" : "var(--bg-input)", border: selectedItemId === it.id ? "1px solid var(--brand-500)" : "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", color: "#f8fafc", cursor: "pointer", textAlign: "left" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                          o.jsxs("span", { style: { fontSize: "10px", color: "var(--brand-400)", fontWeight: 800 }, children: ["#", idx + 1] }),
                          o.jsx("span", { style: { fontSize: "14px", fontWeight: 700 }, children: it.name }),
                          o.jsx("span", { className: "badge badge-neutral", style: { fontSize: "10px", padding: "1px 5px" }, children: it.category })
                        ]}),
                        o.jsxs("div", { style: { fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }, children: [
                          "Size: ", Ua(it), " · In stock: ",
                          o.jsx("strong", { style: { color: itStock && itStock.total_pcs > 0 ? "#34d399" : "#f87171" }, children: itStock ? itStock.total_pcs + " pcs" : "0 pcs" })
                        ]})
                      ]
                    }),
                    o.jsxs("div", {
                      style: { textAlign: "right" },
                      children: [
                        o.jsx("div", { style: { fontSize: "13px", color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono)" }, children: formatMoney(itPrice.defaultPrice) + " Tsh/" + itPrice.unitLabel }),
                        itPrice.isSqm && it.pcs_per_sqm && o.jsxs("div", { style: { fontSize: "10.5px", color: "var(--text-muted)" }, children: ["≈ ", formatMoney(Math.round(itPrice.defaultPrice / it.pcs_per_sqm)), " /pc"] })
                      ]
                    })
                  ]
                });
              })
            })
          ]
        })
      }),

      // View Sale Details Audit Modal
      viewSaleDetail && o.jsx("div", {
        className: "modal-overlay",
        onClick: () => setViewSaleDetail(null),
        children: o.jsxs("div", {
          className: "modal-content",
          onClick: e => e.stopPropagation(),
          style: { padding: "20px", maxWidth: "560px" },
          children: [
            o.jsxs("div", {
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px", marginBottom: "14px" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsx("h3", { style: { fontSize: "17px", fontWeight: 800, color: "#f8fafc" }, children: "Staged Sale Receipt & Audit" }),
                    o.jsxs("p", { style: { fontSize: "12px", color: "var(--text-muted)" }, children: ["Date: ", viewSaleDetail.date, " · Staff: ", f || "Staff"] })
                  ]
                }),
                o.jsx("button", {
                  type: "button",
                  onClick: () => setViewSaleDetail(null),
                  className: "btn btn-ghost btn-sm",
                  children: o.jsx(Yn, { size: 18 })
                })
              ]
            }),
            o.jsxs("div", {
              style: { display: "flex", flexDirection: "column", gap: "12px" },
              children: [
                o.jsxs("div", {
                  style: { background: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "12px" },
                  children: [
                    o.jsx("div", { style: { fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--brand-400)", marginBottom: "4px" }, children: "Customer Information" }),
                    o.jsxs("div", { style: { fontSize: "14px", fontWeight: 700, color: "#f8fafc" }, children: ["Buyer: ", viewSaleDetail.customerName] }),
                    o.jsxs("div", { style: { fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }, children: ["Contacts: ", viewSaleDetail.customerContacts, " | TIN: ", viewSaleDetail.customerTin] }),
                    o.jsxs("div", { style: { fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }, children: ["Destination: ", viewSaleDetail.deliverySite] })
                  ]
                }),
                o.jsxs("div", {
                  children: [
                    o.jsx("div", { style: { fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }, children: "Product Line Items" }),
                    o.jsx("div", {
                      style: { display: "flex", flexDirection: "column", gap: "6px" },
                      children: viewSaleDetail.items.map((it, idx) => o.jsxs("div", {
                        key: idx,
                        style: { background: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" },
                        children: [
                          o.jsxs("div", {
                            children: [
                              o.jsxs("div", { style: { fontSize: "13px", fontWeight: 700, color: "#f8fafc" }, children: [it.itemName, it.color && it.color !== "Standard" ? " (" + it.color + ")" : ""] }),
                              o.jsxs("div", { style: { fontSize: "11px", color: "var(--text-muted)" }, children: [it.qty, " ", it.sellingUnit, it.qtyPcs && it.sellingUnit === "m²" ? " (" + it.qtyPcs + " pcs)" : "", " @ ", formatMoney(it.sellingPrice), " Tsh"] })
                            ]
                          }),
                          o.jsxs("div", {
                            style: { textAlign: "right" },
                            children: [
                              o.jsx("div", { style: { fontSize: "13px", fontWeight: 700, color: "#34d399", fontFamily: "var(--font-mono)" }, children: formatMoney(it.totalAmount) + " Tsh" }),
                              o.jsx("div", { style: { fontSize: "10.5px", color: "var(--text-muted)" }, children: it.account })
                            ]
                          })
                        ]
                      }))
                    })
                  ]
                }),
                o.jsxs("div", {
                  style: { borderTop: "1px solid var(--border-subtle)", paddingTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" },
                  children: [
                    o.jsxs("div", {
                      children: [
                        o.jsx("span", { style: { fontSize: "12px", color: "var(--text-muted)" }, children: "Total Outgoing:" }),
                        o.jsxs("div", { style: { fontSize: "15px", fontWeight: 800, color: "#f8fafc" }, children: [viewSaleDetail.totalPcs.toLocaleString(), " pcs", viewSaleDetail.totalSqm > 0 ? " (" + viewSaleDetail.totalSqm + " m²)" : ""] })
                      ]
                    }),
                    o.jsxs("div", {
                      style: { textAlign: "right" },
                      children: [
                        o.jsx("span", { style: { fontSize: "12px", color: "var(--text-muted)" }, children: "Grand Total:" }),
                        o.jsxs("div", { style: { fontSize: "18px", fontWeight: 800, color: "#34d399", fontFamily: "var(--font-mono)" }, children: [formatMoney(viewSaleDetail.totalAmount), " Tsh"] })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        })
      }),

      // CONFIRMATION POPUP MODAL (Showing all sales to be saved, just like in Production page)
      showConfirmModal && o.jsx("div", {
        className: "modal-overlay",
        onClick: () => setShowConfirmModal(false),
        children: o.jsxs("div", {
          className: "modal-content",
          onClick: ev => ev.stopPropagation(),
          style: { padding: "22px", maxWidth: "620px", maxHeight: "90vh", display: "flex", flexDirection: "column", gap: "16px" },
          children: [
            // Header
            o.jsxs("div", {
              style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" },
              children: [
                o.jsxs("div", {
                  children: [
                    o.jsx("h2", { style: { fontSize: "17px", fontWeight: 800, color: "#f8fafc", margin: 0 }, children: "Daily Sales Verification Document" }),
                    o.jsxs("p", { style: { fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }, children: [
                      "Sales Date: ", o.jsx("strong", { style: { color: "#f8fafc" }, children: saleDate }),
                      " • Total Invoices: ", o.jsx("strong", { style: { color: "#f8fafc" }, children: stagedSales.length }),
                      " • Verified by: ", f || "Staff"
                    ] })
                  ]
                }),
                o.jsx("button", { type: "button", onClick: () => setShowConfirmModal(false), className: "btn-ghost", style: { padding: "4px", color: "var(--text-muted)" }, children: "✕" })
              ]
            }),

            // Body
            o.jsxs("div", {
              style: { overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", flex: 1 },
              children: [
                
                // 1. Invoices to Commit
                o.jsxs("div", {
                  children: [
                    o.jsxs("span", { style: { fontSize: "12px", fontWeight: 700, color: "var(--brand-400)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "6px" }, children: ["1. Sales Invoices to Commit (", stagedSales.length, ")"] }),
                    o.jsx("div", {
                      style: { border: "1px solid var(--border-subtle)", borderRadius: "8px", overflow: "hidden", display: "flex", flexDirection: "column", gap: "6px", background: "rgba(0,0,0,0.2)", padding: "8px" },
                      children: stagedSales.map((sale, sIdx) => o.jsxs("div", {
                        key: sale.id,
                        style: { padding: "10px 12px", background: "var(--bg-surface-elevated)", borderRadius: "6px", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "8px" },
                        children: [
                          o.jsxs("div", {
                            style: { display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "6px" },
                            children: [
                              o.jsxs("div", {
                                children: [
                                  o.jsxs("strong", { style: { fontSize: "13.5px", color: "#f8fafc", display: "inline-flex", alignItems: "center", gap: "5px" }, children: [
                                    o.jsx("span", { children: "👤" }),
                                    sale.customerName
                                  ]}),
                                  o.jsxs("div", { style: { fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }, children: [
                                    "📞 ", sale.customerContacts,
                                    sale.deliverySite && sale.deliverySite !== "Factory Collection" ? " · 📍 " + sale.deliverySite : "",
                                    sale.customerTin && sale.customerTin !== "N/A" ? " · TIN: " + sale.customerTin : ""
                                  ]})
                                ]
                              }),
                              o.jsxs("div", {
                                style: { textAlign: "right" },
                                children: [
                                  o.jsxs("div", { style: { fontWeight: 800, color: "var(--brand-400)", fontSize: "14px", fontFamily: "var(--font-mono)" }, children: [formatMoney(sale.totalAmount), " Tsh"] }),
                                  o.jsxs("div", { style: { fontSize: "10.5px", color: "var(--text-muted)" }, children: [sale.items.length, " item(s) • ", sale.totalPcs.toLocaleString(), " pcs"] })
                                ]
                              })
                            ]
                          }),
                          // Item list
                          o.jsx("div", {
                            style: { display: "flex", flexDirection: "column", gap: "4px" },
                            children: sale.items.map((it, iIdx) => o.jsxs("div", {
                              key: it.subId || iIdx,
                              style: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11.5px", color: "var(--text-secondary)", background: "rgba(0,0,0,0.15)", padding: "4px 8px", borderRadius: "4px" },
                              children: [
                                o.jsxs("div", {
                                  style: { display: "flex", alignItems: "center", gap: "5px" },
                                  children: [
                                    o.jsxs("span", { style: { color: "var(--brand-400)", fontWeight: 700 }, children: [iIdx + 1, "."] }),
                                    o.jsxs("span", { style: { color: "#f8fafc", fontWeight: 600 }, children: [
                                      it.itemName,
                                      it.color && it.color !== "Standard" ? " (" + it.color + ")" : ""
                                    ]}),
                                    o.jsx("span", { style: { color: "var(--text-muted)" }, children: "—" }),
                                    o.jsxs("span", { style: { fontFamily: "var(--font-mono)" }, children: [
                                      it.qty, " ", it.sellingUnit,
                                      it.qtyPcs && it.sellingUnit === "m²" ? " (" + it.qtyPcs + " pcs)" : ""
                                    ]})
                                  ]
                                }),
                                o.jsxs("div", {
                                  style: { display: "flex", alignItems: "center", gap: "8px" },
                                  children: [
                                    o.jsx("span", { className: "badge badge-neutral", style: { fontSize: "9.5px", padding: "1px 5px" }, children: it.account || "Cash" }),
                                    o.jsxs("strong", { style: { color: "#34d399", fontFamily: "var(--font-mono)" }, children: [formatMoney(it.totalAmount), " Tsh"] })
                                  ]
                                })
                              ]
                            }, iIdx))
                          })
                        ]
                      }, sale.id))
                    })
                  ]
                }),

                // 2. Total Outgoing Stock to Deduct from Inventory
                o.jsxs("div", {
                  children: [
                    o.jsx("span", { style: { fontSize: "12px", fontWeight: 700, color: "var(--brand-400)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "6px" }, children: "2. Total Outgoing Stock Deductions" }),
                    o.jsxs("div", {
                      style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" },
                      children: [
                        o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", display: "block" }, children: "Total Quantity" }),
                            o.jsxs("strong", { style: { fontSize: "16px", color: "#f87171", fontFamily: "var(--font-mono)" }, children: ["-", totalSalesPieces.toLocaleString(), " pcs"] })
                          ]
                        }),
                        totalSalesSqm > 0 ? o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", display: "block" }, children: "Total Area" }),
                            o.jsxs("strong", { style: { fontSize: "16px", color: "#f87171", fontFamily: "var(--font-mono)" }, children: ["-", totalSalesSqm.toFixed(2), " m²"] })
                          ]
                        }) : null,
                        o.jsxs("div", {
                          style: { background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", textAlign: "center" },
                          children: [
                            o.jsx("span", { style: { fontSize: "10.5px", color: "var(--text-muted)", display: "block" }, children: "Total Revenue" }),
                            o.jsxs("strong", { style: { fontSize: "16px", color: "#34d399", fontFamily: "var(--font-mono)" }, children: [formatMoney(totalSalesRevenue), " Tsh"] })
                          ]
                        })
                      ]
                    })
                  ]
                }),

                // 3. Payment Accounts Breakdown
                salesAccountBreakdown.length > 0 && o.jsxs("div", {
                  children: [
                    o.jsx("span", { style: { fontSize: "12px", fontWeight: 700, color: "var(--brand-400)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "6px" }, children: "3. Payment Accounts Breakdown" }),
                    o.jsx("div", {
                      style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" },
                      children: salesAccountBreakdown.map(([acc, amt]) => o.jsxs("div", {
                        key: acc,
                        style: { background: "rgba(0,0,0,0.3)", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" },
                        children: [
                          o.jsxs("span", { style: { fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }, children: ["🏦 ", acc] }),
                          o.jsxs("strong", { style: { fontSize: "13px", color: "#f8fafc", fontFamily: "var(--font-mono)" }, children: [formatMoney(amt), " Tsh"] })
                        ]
                      }))
                    })
                  ]
                })

              ]
            }),

            // Footer Buttons
            o.jsxs("div", {
              style: { display: "flex", gap: "10px", paddingTop: "10px", borderTop: "1px solid var(--border-subtle)" },
              children: [
                o.jsx("button", {
                  type: "button",
                  onClick: () => setShowConfirmModal(false),
                  className: "btn btn-secondary",
                  style: { flex: 1, height: "46px" },
                  children: "Back to Editing"
                }),
                o.jsxs("button", {
                  type: "button",
                  disabled: isSubmitting,
                  onClick: handleExecuteDispatch,
                  className: "btn btn-primary",
                  style: { flex: 2, height: "46px", background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none" },
                  children: [
                    o.jsx(Vp, { size: 18 }),
                    o.jsx("span", { children: isSubmitting ? "Committing to Supabase..." : "Confirm & Commit to Unified Ledger" })
                  ]
                })
              ]
            })

          ]
        })
      })
    ]
  });
}`;

console.log('b1 code length:', b1ComponentCode.length);

const bundlePath = 'assets/index-hgjhj-0G.js';
const bundleContent = fs.readFileSync(bundlePath, 'utf8');

const b1StartPattern = ',b1=({prefillItemId:s';
const b1StartIdx = bundleContent.indexOf(b1StartPattern);
if (b1StartIdx === -1) {
  throw new Error('Could not find b1 start pattern');
}

const w1Pattern = ',w1=';
const w1Idx = bundleContent.indexOf(w1Pattern, b1StartIdx);
if (w1Idx === -1) {
  throw new Error('Could not find w1 pattern after b1');
}

console.log('Found b1 at:', b1StartIdx, 'and w1 at:', w1Idx);
console.log('Replacing existing b1 length:', w1Idx - b1StartIdx - 1);

// Test syntax of b1ComponentCode with node vm
const vm = require('vm');
try {
  new vm.Script('let ' + b1ComponentCode);
  console.log('Component code passed JS syntax validation!');
} catch (e) {
  console.error('Syntax error in b1ComponentCode:', e);
  process.exit(1);
}

const newBundle = bundleContent.substring(0, b1StartIdx + 1) + b1ComponentCode + bundleContent.substring(w1Idx);

fs.writeFileSync(bundlePath, newBundle);
console.log('Successfully updated assets/index-hgjhj-0G.js!');

const swPath = 'service-worker.js';
if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf8');
  swContent = swContent.replace(/const CACHE_NAME = 'stumarcot-pwa-v[^']+';/, "const CACHE_NAME = 'stumarcot-pwa-v1.7.0-" + Date.now() + "';");
  fs.writeFileSync(swPath, swContent);
  console.log('Updated service-worker.js cache name');
}
