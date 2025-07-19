const mongoose = require('mongoose');

// Modelo de teste completamente novo
const testPaymentSchema = new mongoose.Schema({
  data: Date,
  valor: Number,
  realizada: Boolean,
  paga: String,
  observacao: String
}, {
  collection: 'test_payments', // Collection diferente
  strict: false
});

module.exports = mongoose.model('TestPayment', testPaymentSchema);
