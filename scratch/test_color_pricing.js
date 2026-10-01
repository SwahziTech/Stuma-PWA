const fs = require('fs');

function getItemColorPrice(item, color) {
  if (!item) return { price: 0, unitLabel: "pcs", isSqm: false };
  const name = (item.name || "").toLowerCase();
  const cat = (item.category || "").toLowerCase();
  const col = (color || "White").toLowerCase();
  const isSqm = item.unit === "sqm";

  // Base offwhite / white price
  let basePrice = 25500;
  let colorDelta = 0;

  if (isSqm) {
    if (cat.includes("floor") || cat.includes("wall")) {
      basePrice = 25500;
      if (name.includes("slab")) basePrice = 16500;
      else if (name.includes("combo") && name.includes("800")) basePrice = 32500;

      // Color rules for Floor & Wall tiles from Excel: Red 27,500, Grey 27,500, Black 31,500
      if (col.includes("red") || col.includes("grey") || col.includes("gray") || col.includes("maroon")) {
        colorDelta = 2000;
      } else if (col.includes("black")) {
        colorDelta = 6000;
      }
      return { price: basePrice + colorDelta, unitLabel: "m²", isSqm: true };
    }

    if (cat.includes("paving")) {
      const isVibro = name.includes("u-dot") || name.includes("u dot") || name.includes("z-plain") || name.includes("z plain") || name.includes("trio") || name.includes("culture") || name.includes("v paver") || name.includes("v-shape") || name.includes("kisu");
      if (isVibro) {
        basePrice = 29500;
        // Vibration pavers from Excel: Red 31,500 (+2k), Grey 31,500 (+2k), Black 34,500 (+5k)
        if (col.includes("red") || col.includes("grey") || col.includes("gray") || col.includes("maroon")) {
          colorDelta = 2000;
        } else if (col.includes("black")) {
          colorDelta = 5000;
        }
        return { price: basePrice + colorDelta, unitLabel: "m²", isSqm: true };
      } else {
        // Press pavers from Excel: increase of Tsh 3000 per sqmt for red and grey
        if (name.includes("40") || name.includes("45") || name.includes("mpa-40")) basePrice = 35000;
        else if (name.includes("60") || name.includes("6cm") || name.includes("rough 6cm") || name.includes("worldcup")) basePrice = 25830;
        else basePrice = 31500;

        if (col.includes("red") || col.includes("grey") || col.includes("gray") || col.includes("black") || col.includes("maroon")) {
          colorDelta = 3000;
        }
        return { price: basePrice + colorDelta, unitLabel: "m²", isSqm: true };
      }
    }

    return { price: basePrice + colorDelta, unitLabel: "m²", isSqm: true };
  }

  // Pcs products
  let pcsPrice = 1000;
  if (cat.includes("culvert")) {
    if (name.includes("900n")) pcsPrice = 146000;
    else if (name.includes("900r") || name.includes("600n")) pcsPrice = 116000;
    else if (name.includes("600r") || name.includes("400n")) pcsPrice = 96000;
    else if (name.includes("400r")) pcsPrice = 76000;
    else pcsPrice = 96000;
  } else if (cat.includes("kerb") || cat.includes("curb")) {
    if (name.includes("panasonic")) pcsPrice = 18500;
    else if (name.includes("100") || name.includes("80")) pcsPrice = 17500;
    else if (name.includes("60") || name.includes("50 press")) pcsPrice = 13500;
    else if (name.includes("50") || name.includes("bevo") || name.includes("bevel")) pcsPrice = 11500;
    else pcsPrice = 13500;
  } else if (cat.includes("mifuniko") || cat.includes("cover")) {
    if (name.includes("mkubwa") || name.includes("cm80") || name.includes("cm60") || name.includes("nondo") || name.includes("ulalo")) pcsPrice = 13500;
    else pcsPrice = 11500;
  } else if (cat.includes("pole") || cat.includes("nguzo")) {
    if (name.includes("bicon")) pcsPrice = 26000;
    else pcsPrice = 8000;
  } else if (cat.includes("block") || cat.includes("tofali") || cat.includes("matofali") || cat.includes("chipping")) {
    if (name.includes("dust") || name.includes("chip") || name.includes('8"')) pcsPrice = 2242;
    else if (name.includes("hollow")) pcsPrice = 1888;
    else pcsPrice = 1770;
  }

  // If pcs product has color (rare, e.g. kerbstones if colored)
  if (col.includes("red") || col.includes("grey") || col.includes("black")) {
    // minor proportional or fixed surcharge if applicable
  }

  return { price: pcsPrice, unitLabel: "pcs", isSqm: false };
}

const testItem1 = { name: "40 Dot", category: "Floor Tiles", unit: "sqm", pcs_per_sqm: 6 };
const testItem2 = { name: "Trio", category: "Paving Blocks", unit: "sqm" };
const testItem3 = { name: "Zigzag CM8", category: "Paving Blocks", unit: "sqm" };

["White", "Red", "Grey", "Black"].forEach(c => {
  console.log("40 Dot (" + c + "):", getItemColorPrice(testItem1, c).price, "Tsh/m²");
});
["White", "Red", "Grey", "Black"].forEach(c => {
  console.log("Trio (" + c + "):", getItemColorPrice(testItem2, c).price, "Tsh/m²");
});
["White", "Red", "Grey"].forEach(c => {
  console.log("Zigzag CM8 (" + c + "):", getItemColorPrice(testItem3, c).price, "Tsh/m²");
});
