const mongoose = require('mongoose');

const tempPaymentSchema = new mongoose.Schema({
  data: { type: Date, required: true },
  realizada: { type: Boolean, default: false },
  valor: {
    type: Number,
    required: true,
    get: v => (v/100).toFixed(2),
    set: v => v * 100
  },
  paga: { type: String, default: '' },
  dataPagamento: { type: Date },
  observacao: { type: String, default: '' }
}, {
  timestamps: true,
  toJSON: { getters: true, virtuals: true }
});

const TempPayment = mongoose.model('TempPayment', tempPaymentSchema);

module.exports = TempPayment;
