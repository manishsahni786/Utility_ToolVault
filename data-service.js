const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

async function excelToCsv({ filePath }) {
  const workbook = XLSX.readFile(filePath);
  const sheetNames = workbook.SheetNames;
  const outDir = path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)) + '_csv');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const csvFiles = [];
  for (const name of sheetNames) {
    const csvPath = path.join(outDir, `${name}.csv`);
    const worksheet = workbook.Sheets[name];
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    fs.writeFileSync(csvPath, csv);
    csvFiles.push(csvPath);
  }
  return { success: true, sheets: sheetNames.length, csvCount: csvFiles.length, csvFiles, outputDir: outDir };
}

module.exports = { excelToCsv };
