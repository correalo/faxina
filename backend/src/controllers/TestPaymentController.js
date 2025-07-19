const TestPayment = require('../models/TestPayment');

// Criar novo pagamento de teste
exports.create = async (req, res) => {
  try {
    console.log('Creating test payment:', req.body);
    
    const testPayment = new TestPayment({
      data: req.body.data,
      valor: req.body.valor,
      realizada: req.body.realizada || false,
      paga: req.body.paga || '',
      observacao: req.body.observacao || ''
    });
    
    const savedPayment = await testPayment.save();
    console.log('Test payment saved:', savedPayment);
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Error creating test payment:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : []
    });
  }
};
