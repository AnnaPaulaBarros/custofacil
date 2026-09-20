window.CustoFacilCalculations = {
  materialCost(purchasePrice, purchaseQuantity, usedQuantity) {
    return purchaseQuantity > 0 ? purchasePrice / purchaseQuantity * usedQuantity : 0;
  },
  laborCost(hourlyRate, hours, minutes) {
    return hourlyRate * (hours * 60 + minutes) / 60;
  },
  indirectCost(monthlyValue, monthlyProduction) {
    return monthlyProduction > 0 ? monthlyValue / monthlyProduction : 0;
  },
  pricing({ materials, labor, indirect, lossPercent, fees, margin }) {
    const loss = (materials + labor + indirect) * lossPercent;
    const totalCost = materials + labor + indirect + loss;
    const divisor = Math.max(0.01, 1 - margin - fees);
    const suggestedPrice = totalCost / divisor;
    const profit = suggestedPrice * (1 - fees) - totalCost;
    return { loss, totalCost, suggestedPrice, profit, markup: suggestedPrice / (totalCost || 1) };
  },
  breakEven(fixedCosts, sellingPrice, variableCost) {
    const contribution = sellingPrice - variableCost;
    return contribution > 0 ? fixedCosts / contribution : 0;
  },
  salesForProfit(targetProfit, fixedCosts, sellingPrice, variableCost) {
    const contribution = sellingPrice - variableCost;
    return contribution > 0 ? (targetProfit + fixedCosts) / contribution : 0;
  }
};
