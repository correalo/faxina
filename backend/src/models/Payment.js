const mongoose = require('mongoose');

// Limpar cache do modelo completamente
if (mongoose.models.Payment) {
  delete mongoose.models.Payment;
}
if (mongoose.connection.models.Payment) {
  delete mongoose.connection.models.Payment;
}

// Schema completamente novo sem validações problemáticas
const paymentSchema = new mongoose.Schema({
  dataString: {
    type: String,
    required: true
  },
  data: Date, // Mantido para compatibilidade
  valor: {
    type: Number,
    default: 0
  },
  realizada: { type: Boolean, default: false },
  paga: { type: String, default: '' }, // Mesma lógica do campo realizada
  dataPagamento: Date,
  observacao: { type: String, default: '' }
}, {
  timestamps: true,
  toJSON: { getters: true, virtuals: true },
  strict: false,
  validateBeforeSave: false
});

// Virtual para o mês/ano do pagamento
paymentSchema.virtual('monthYear').get(function() {
  if (this.dataString && typeof this.dataString === 'string') {
    return this.dataString.substring(0, 7); // Get "2024-07" from "2024-07-18"
  }
  return '';
});

// Pre-hook removido para evitar interferência na validação

// Virtual para o status completo do pagamento
paymentSchema.virtual('status').get(function() {
  if (this.paga === 'PAGA') return 'PAGA';
  if (this.realizada) return 'REALIZADA';
  return 'PENDENTE';
});

// Índices
paymentSchema.index({ data: 1 });
paymentSchema.index({ 'paga': 1 });
paymentSchema.index({ 'realizada': 1 });
paymentSchema.index({ dataPagamento: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
