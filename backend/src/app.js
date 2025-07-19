const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Routes
const paymentsRouter = require('./routes/payments');
app.use('/api/payments', paymentsRouter);

// Rota de teste simples
app.get('/api/test', (req, res) => {
  res.json({ message: 'Rota de teste funcionando', timestamp: new Date() });
});

// Rota para modelo limpo de pagamentos
const CleanPaymentController = require('./controllers/CleanPaymentController');
app.post('/api/clean-payments', CleanPaymentController.create);
app.get('/api/clean-payments', CleanPaymentController.list);

// Rota direta para contornar problema de validação
app.post('/api/create-payment', async (req, res) => {
  try {
    console.log('=== ROTA DIRETA EXECUTADA ===');
    console.log('Dados recebidos:', req.body);
    
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    const collection = db.collection('payments');
    
    // Preparar dados com valores padrão
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
    const savedPayment = await collection.findOne({ _id: result.insertedId });
    
    console.log('Pagamento criado com sucesso:', savedPayment);
    res.status(201).json(savedPayment);
    
  } catch (error) {
    console.error('Erro na rota direta:', error);
    res.status(400).json({ 
      message: error.message,
      error: 'Erro na rota direta'
    });
  }
});

// Rotas temporárias para teste
const TempPaymentController = require('./controllers/TempPaymentController');
const SimplePaymentController = require('./controllers/SimplePaymentController');
const TestPaymentController = require('./controllers/TestPaymentController');
app.post('/api/temp-payments', TempPaymentController.create);
app.post('/api/simple-payments', SimplePaymentController.create);
app.post('/api/test-payments', TestPaymentController.create);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});
