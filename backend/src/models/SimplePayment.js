const mongoose = require('mongoose');

// Modelo completamente novo e simples para testar campos opcionais
const simplePaymentSchema = new mongoose.Schema({
  data: Date,
  valor: Number,
  realizada: Boolean,
  paga: String,
  observacao: String,
  dataPagamento: Date
}, {
  timestamps: true,
  strict: false
});

const SimplePayment = mongoose.model('SimplePayment', simplePaymentSchema);

module.exports = SimplePayment;
