import fs from 'fs';
const filePath = 'C:/Users/sherwin/Desktop/TRACKLY V3/src/pages/PersonalDashboardPage.jsx';
const lines = fs.readFileSync(filePath, 'utf8').split('\n');
lines.forEach((line, index) => {
  if (line.includes('addForm') || line.includes('handleAddManual') || line.includes('handleAddRecord')) {
    console.log(`${index + 1}: ${line}`);
  }
});
