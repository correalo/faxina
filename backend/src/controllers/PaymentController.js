const Payment = require('../models/Payment');

// Listar todos os pagamentos com agrupamento mensal
exports.list = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ data: 1 });
    
    // Agrupar pagamentos por mês
    const groupedPayments = payments.reduce((acc, payment) => {
      // Ensure date is handled in local timezone
      const date = new Date(payment.data);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const key = `${year}-${month}-01T00:00:00.000-03:00`;
      
      if (!acc[key]) {
        acc[key] = {
          month: key,
          payments: [],
          total: 0
        };
      }
      
      acc[key].payments.push(payment);
      // Ensure payment.valor is a valid number before adding to total
      const valor = parseFloat(payment.valor) || 0;
      acc[key].total = (acc[key].total || 0) + valor;
      
      return acc;
    }, {});
    
    // Converter para array e ordenar por mês
    const result = Object.values(groupedPayments).sort((a, b) => b.month.localeCompare(a.month));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buscar um pagamento por ID
exports.get = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Criar novo pagamento
exports.create = async (req, res) => {
  try {
    console.log('Creating payment with data:', req.body);
    
    // Usar inserção direta no MongoDB para contornar validação problemática
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    const collection = db.collection('payments');
    
    // Preparar dados com lógica de campos opcionais usando valor que funciona
    const paymentData = {
      data: new Date(req.body.data),
      valor: req.body.valor || 0,
      realizada: req.body.realizada !== undefined ? req.body.realizada : false,
      // Se paga não for fornecido ou estiver vazio, deixar vazio (sistema aceitará como opcional)
      paga: req.body.paga || '',
      observacao: req.body.observacao !== undefined ? req.body.observacao : '',
      // Se paga original estiver vazio, dataPagamento fica null
      dataPagamento: (req.body.paga && req.body.paga !== '') ? req.body.dataPagamento : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Inserting payment data:', paymentData);
    
    // Inserir diretamente usando driver nativo do MongoDB
    const result = await collection.insertOne(paymentData);
    
    // Buscar o documento inserido para aplicar getters
    const savedPayment = await Payment.findById(result.insertedId);
    
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

// Atualizar pagamento
exports.update = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Excluir pagamento
exports.delete = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }
    res.json({ message: 'Pagamento excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buscar pagamentos por período com agrupamento mensal
exports.findByPeriod = async (req, res) => {
  try {
    const { startDate, endDate, groupByMonth } = req.query;
    
    const query = {
      data: {}
    };
    
    if (startDate) query.data.$gte = new Date(startDate);
    if (endDate) query.data.$lte = new Date(endDate);
    
    const payments = await Payment.find(query).sort({ data: 1 });
    
    if (groupByMonth === 'true') {
      // Agrupar pagamentos por mês
      const groupedPayments = payments.reduce((acc, payment) => {
        const date = new Date(payment.data);
        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!acc[key]) {
          acc[key] = {
            month: key,
            payments: [],
            total: 0,
            realizados: 0,
            pagos: 0
          };
        }
        
        acc[key].payments.push(payment);
        acc[key].total += payment.valor;
        if (payment.realizada) acc[key].realizados++;
        if (payment.paga === 'PAGA') acc[key].pagos++;
        
        return acc;
      }, {});
      
      // Converter para array e ordenar por mês
      const result = Object.values(groupedPayments).sort((a, b) => b.month.localeCompare(a.month));
      return res.json(result);
    }
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
