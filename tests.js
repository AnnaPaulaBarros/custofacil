(() => {
  const formulas = window.CustoFacilCalculations;
  const tests = [
    ['material cost', () => formulas.materialCost(20, 10, 0.5) === 1],
    ['labor cost', () => formulas.laborCost(10, 0, 30) === 5],
    ['indirect cost', () => formulas.indirectCost(500, 100) === 5],
    ['pricing', () => Math.abs(formulas.pricing({ materials: 8.5, labor: 5, indirect: 1.2, lossPercent: 0.05, fees: 0.06, margin: 0.3 }).suggestedPrice - 24.12) < 0.01],
    ['break even', () => formulas.breakEven(500, 30, 15) === 33.333333333333336],
    ['sales for profit', () => formulas.salesForProfit(1000, 500, 30, 15) === 100]
  ];
  const failures = tests.filter(([, test]) => !test()).map(([name]) => name);
  console.log(`[CustoFácil] ${tests.length - failures.length}/${tests.length} testes aprovados`);
  if (failures.length) throw new Error(`Testes falharam: ${failures.join(', ')}`);
})();
