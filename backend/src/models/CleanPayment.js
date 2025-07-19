const mongoose = require('mongoose');

// Modelo completamente novo e limpo para pagamentos
const cleanPaymentSchema = new mongoose.Schema({
  data: { type: Date, required: true },
  valor: { 
    type: Number, 
    required: true,
    get: v => v ? (v/100).toFixed(2) : '0.00',
    set: v => {
      if (typeof v === 'number') {
        return v > 1000 ? v : Math.round(v * 100);
      }
      return v;
    }
  },
  realizada: { type: Boolean, default: false },
  paga: { type: String, default: 'PENDENTE' }, // Valor padrão não vazio
  observacao: { type: String, default: '' },
  dataPagamento: Date
}, {
  collection: 'payments', // Usar a mesma collection
  timestamps: true,
  toJSON: { getters: true, virtuals: true }
});

// Virtual para o mês/ano do pagamento
cleanPaymentSchema.virtual('monthYear').get(function() {
  return `${this.data.getFullYear()}-${(this.data.getMonth() + 1).toString().padStart(2, '0')}`;
});

// Virtual para o status completo do pagamento
cleanPaymentSchema.virtual('status').get(function() {
  if (this.paga === 'PAGA') return 'PAGA';
  if (this.realizada) return 'REALIZADA';
  return 'PENDENTE';
});

// Índices
cleanPaymentSchema.index({ data: 1 });
cleanPaymentSchema.index({ 'paga': 1 });

module.exports = mongoose.model('CleanPayment', cleanPaymentSchema);
