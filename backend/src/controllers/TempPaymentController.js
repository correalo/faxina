const TempPayment = require('../models/TempPayment');

// Criar novo pagamento temporário para teste
exports.create = async (req, res) => {
  try {
    console.log('Temp payment - Received data:', req.body);
    
    const payment = new TempPayment(req.body);
    console.log('Temp payment - Created model:', payment);
    
    const savedPayment = await payment.save();
    console.log('Temp payment - Saved:', savedPayment);
    
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Temp payment - Error:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
};

module.exports = exports;
