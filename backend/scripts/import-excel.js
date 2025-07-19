require('dotenv').config();
const XLSX = require('xlsx');
const mongoose = require('mongoose');
const Payment = require('../src/models/Payment');
const path = require('path');

const convertCurrency = (valor) => {
  if (!valor) return 0;
  // Remove R$ and convert to number
  const numStr = String(valor).replace('R$', '').replace(',', '.').trim();
  return parseFloat(numStr);
};

const convertDate = (dateValue) => {
  if (!dateValue) return null;
  
  // If already a string in DD/MM/YYYY format
  if (typeof dateValue === 'string' && dateValue.includes('/')) {
    const [day, month, year] = dateValue.split('/');
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  }
  
  // If it's an Excel serial number
  if (typeof dateValue === 'number') {
    // Convert Excel serial number to JavaScript date
    const date = new Date((dateValue - 25569) * 86400 * 1000);
    return date;
  }
  
  return null;
};

async function importExcel() {
  // Using absolute path for Excel file
  const excelFile = path.join(__dirname, '..', 'data', 'faxina.xlsx');
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB!');

    // Read Excel file
    console.log('Reading Excel file:', excelFile);
    const workbook = XLSX.readFile(excelFile);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: true,
      dateNF: 'DD/MM/YYYY'
    });
    
    console.log(`Total Excel rows: ${data.length}`);
    
    // Count current records before clearing
    const beforeCount = await Payment.countDocuments();
    console.log(`Records in database before import: ${beforeCount}`);
    
    await Payment.deleteMany({});
    console.log('Existing data removed');

    // Process records
    const payments = data
      .map((row, index) => {
        const payment = {
          data: convertDate(row.DATA),
          realizada: row.REALIZADA === 'SIM' || row.REALIZADA === 'REALIZADA',
          valor: convertCurrency(row.VALOR),
          paga: row.PAGA || '',
          dataPagamento: convertDate(row['DATA DE PAGAMENTO']),
          observacao: row.OBSERVAÇÃO || ''
        };
        
        if (!payment.data) {
          console.log(`Row ${index + 1} skipped - invalid date`);
        }
        if (!payment.valor) {
          console.log(`Row ${index + 1} skipped - zero value`);
        }
        
        return payment;
      })
      .filter(payment => payment.data);

    console.log(`Valid records for import: ${payments.length}`);
    
    if (payments.length === 0) {
      throw new Error('No records found in file');
    }

    const result = await Payment.insertMany(payments);
    console.log('All payments imported successfully!');
    
    // Final validation
    const afterCount = await Payment.countDocuments();
    console.log(`Total records: ${afterCount}`);
    if (afterCount !== payments.length) {
      console.warn(`Warning: Difference between processed records (${payments.length}) and saved (${afterCount})`);
    }

  } catch (error) {
    console.error('Import error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Execute import
importExcel()
  .then(() => console.log('Import completed!'))
  .catch(err => console.error('Excel import error:', err));