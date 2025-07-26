const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/uploads', express.static('uploads'));

// CORS configuration
app.use(cors());

// Debug middleware
app.use((req, res, next) => {
  console.log(`[DEBUG] Requisição: ${req.method} ${req.url}`);
  next();
});

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Rota de teste simples
app.get('/api/test', (req, res) => {
  console.log('Rota /api/test acessada');
  res.json({ message: 'Rota de teste funcionando', timestamp: new Date() });
});



// Importar rotas
const paymentsRouter = require('./routes/payments');
app.use('/api/payments', paymentsRouter);

// Rotas da API

// 404 handler - deve ser o último middleware
app.use((req, res) => {
  console.log(`[404] Rota não encontrada: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});
