const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Rota completamente nova e isolada para criar pagamentos
router.post('/', async (req, res) => {
  try {
    console.log('=== NOVA ROTA DE PAGAMENTOS ===');
    console.log('Dados recebidos:', req.body);
    
    // Usar driver nativo do MongoDB diretamente
    const db = mongoose.connection.db;
    const collection = db.collection('payments');
    
    // Preparar dados com valores padrão para campos opcionais
    const paymentData = {
      data: new Date(req.body.data),
      valor: req.body.valor || 0,
      realizada: req.body.realizada !== undefined ? req.body.realizada : false,
      paga: req.body.paga !== undefined ? req.body.paga : '',
      observacao: req.body.observacao !== undefined ? req.body.observacao : '',
      dataPagamento: req.body.dataPagamento || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Dados processados:', paymentData);
    
    // Inserir diretamente no MongoDB
    const result = await collection.insertOne(paymentData);
    
    // Buscar o documento inserido
    const savedPayment = await collection.findOne({ _id: result.insertedId });
    
    console.log('Pagamento salvo:', savedPayment);
    res.status(201).json(savedPayment);
    
  } catch (error) {
    console.error('Erro na nova rota:', error);
    res.status(400).json({ 
      message: error.message,
      error: 'Erro na nova rota de pagamentos'
    });
  }
});

module.exports = router;
