const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// Import the Payment model
const Payment = require('../src/models/Payment');

async function convertValuesToReais() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/faxina');
    console.log('Connected to MongoDB');

    // Find all payments
    const payments = await Payment.find({});
    console.log(`Found ${payments.length} payments to convert`);

    let convertedCount = 0;

    for (const payment of payments) {
      // Check if value seems to be in centavos (greater than 1000 suggests centavos)
      if (payment.valor && payment.valor > 1000) {
        const originalValue = payment.valor;
        const newValue = payment.valor / 100;
        
        console.log(`Converting payment ${payment._id}: ${originalValue} -> ${newValue}`);
        
        await Payment.findByIdAndUpdate(payment._id, {
          valor: newValue
        });
        
        convertedCount++;
      } else {
        console.log(`Skipping payment ${payment._id}: value ${payment.valor} seems already in reais`);
      }
    }

    console.log(`\n✅ Conversion completed!`);
    console.log(`📊 Total payments processed: ${payments.length}`);
    console.log(`🔄 Values converted: ${convertedCount}`);
    console.log(`⏭️  Values skipped: ${payments.length - convertedCount}`);

  } catch (error) {
    console.error('❌ Error during conversion:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the conversion
convertValuesToReais();
