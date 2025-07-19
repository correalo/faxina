const CleanPayment = require('../models/CleanPayment');

// Criar novo pagamento com modelo limpo
exports.create = async (req, res) => {
  try {
    console.log('Creating payment with CleanPayment model:', req.body);
    
    // Preparar dados com valores padrão para campos opcionais
    const paymentData = {
      data: new Date(req.body.data),
      valor: req.body.valor || 0,
      realizada: req.body.realizada !== undefined ? req.body.realizada : false,
      paga: req.body.paga || 'PENDENTE', // Usar valor padrão não vazio
      observacao: req.body.observacao || '',
      dataPagamento: req.body.dataPagamento || null
    };
    
    console.log('Processed payment data:', paymentData);
    
    // Criar usando o modelo limpo
    const payment = new CleanPayment(paymentData);
    const savedPayment = await payment.save();
    
    console.log('Payment created successfully:', savedPayment);
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : []
    });
  }
};

// Listar pagamentos
exports.list = async (req, res) => {
  try {
    const payments = await CleanPayment.find().sort({ data: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error listing payments:', error);
    res.status(500).json({ message: error.message });
  }
};
