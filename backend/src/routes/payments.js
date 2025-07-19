const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');

// Debug middleware for this router
router.use((req, res, next) => {
  console.log('Payment Router:', {
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body
  });
  next();
});

// Listar todos os pagamentos
router.get('/', async (req, res, next) => {
  try {
    console.log('Listing all payments');
    await PaymentController.list(req, res);
  } catch (error) {
    console.error('Error listing payments:', error);
    next(error);
  }
});

// Buscar pagamentos por período
router.get('/period', async (req, res, next) => {
  try {
    console.log('Finding payments by period:', req.query);
    await PaymentController.findByPeriod(req, res);
  } catch (error) {
    console.error('Error finding payments by period:', error);
    next(error);
  }
});

// Buscar um pagamento específico
router.get('/:id', async (req, res, next) => {
  try {
    console.log('Getting payment by id:', req.params.id);
    await PaymentController.get(req, res);
  } catch (error) {
    console.error('Error getting payment:', error);
    next(error);
  }
});

// Criar novo pagamento
router.post('/', async (req, res, next) => {
  try {
    console.log('Creating new payment:', req.body);
    await PaymentController.create(req, res);
  } catch (error) {
    console.error('Error creating payment:', error);
    next(error);
  }
});

// Atualizar pagamento
router.put('/:id', async (req, res, next) => {
  try {
    console.log('Updating payment:', req.params.id, req.body);
    await PaymentController.update(req, res);
  } catch (error) {
    console.error('Error updating payment:', error);
    next(error);
  }
});

// Excluir pagamento
router.delete('/:id', async (req, res, next) => {
  try {
    console.log('Deleting payment:', req.params.id);
    await PaymentController.delete(req, res);
  } catch (error) {
    console.error('Error deleting payment:', error);
    next(error);
  }
});

module.exports = router;
