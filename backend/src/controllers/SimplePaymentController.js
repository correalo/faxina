const SimplePayment = require('../models/SimplePayment');

// Criar novo pagamento simples para teste
exports.create = async (req, res) => {
  try {
    console.log('Simple payment - Received data:', req.body);
    
    const payment = new SimplePayment(req.body);
    console.log('Simple payment - Created model:', payment);
    
    const savedPayment = await payment.save();
    console.log('Simple payment - Saved:', savedPayment);
    
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Simple payment - Error:', error);
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
