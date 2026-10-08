const vm = require('vm');

const test = `
const a = 1,
DashboardSalesRecordView = () => {},
x1 = () => {},
ProductionCapacityPlannerView = () => {},
_1 = () => {},
b1 = () => {};
`;

try {
  new vm.Script(test);
  console.log('✓ Comma-separated variable declaration syntax works 100%!');
} catch (e) {
  console.error('Error:', e);
}
