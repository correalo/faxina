const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Definir schema diretamente no teste
const testPaymentSchema = new mongoose.Schema({
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

const TestPayment = mongoose.model('TestPayment', testPaymentSchema);

// Testar criação de pagamento
async function testPaymentCreation() {
  try {
    console.log('Testando criação de pagamento com campos opcionais...');
    
    const paymentData = {
      data: new Date('2025-07-19'),
      valor: 22000
    };
    
    console.log('Dados do pagamento:', paymentData);
    
    const payment = new TestPayment(paymentData);
    console.log('Modelo criado:', payment);
    
    const savedPayment = await payment.save();
    console.log('Pagamento salvo com sucesso:', savedPayment);
    
    // Limpar teste
    await TestPayment.deleteOne({ _id: savedPayment._id });
    console.log('Teste limpo com sucesso');
    
  } catch (error) {
    console.error('Erro no teste:', error.message);
    console.error('Detalhes:', error.errors);
  } finally {
    mongoose.connection.close();
  }
}

testPaymentCreation();
