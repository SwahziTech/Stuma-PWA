const fs = require('fs');

console.log('Testing layout structure logic...');

// Test 1: Tanzanian Phone numbers
const validateTzPhone = (phone) => {
  if (!phone) return false;
  const clean = String(phone).replace(/[\s\-\(\)\.]/g, "");
  return /^(?:\+?255|0)[67]\d{8}$/.test(clean);
};

const phones = [
  "0712345678",
  "0654112233",
  "+255712345678",
  "+255 712 345 678",
  "0712 345 678",
  "0812345678", // invalid prefix
  "12345",      // too short
  "07123456789" // too long
];

phones.forEach(p => {
  console.log(p.padEnd(20), '=>', validateTzPhone(p) ? 'VALID' : 'INVALID');
});
