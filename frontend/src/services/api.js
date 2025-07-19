import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
});

export const PaymentService = {
  // Listar todos os pagamentos
  list: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  // Buscar pagamento por ID
  get: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Criar novo pagamento
  create: async (payment) => {
    const response = await api.post('/payments', payment);
    return response.data;
  },

  // Atualizar pagamento
  update: async (id, payment) => {
    const response = await api.put(`/payments/${id}`, payment);
    return response.data;
  },

  // Excluir pagamento
  delete: async (id) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },

  // Buscar pagamentos por período com agrupamento mensal opcional
  findByPeriod: async (startDate, endDate, groupByMonth = true) => {
    const response = await api.get('/payments/period', {
      params: { startDate, endDate, groupByMonth }
    });
    return response.data;
  },

  // Buscar pagamentos do mês atual
  getCurrentMonth: async () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return PaymentService.findByPeriod(startDate, endDate, true);
  },

  // Atualizar status do pagamento
  updateStatus: async (id, { realizada, paga }) => {
    const response = await api.put(`/payments/${id}`, { realizada, paga });
    return response.data;
  },

  // Buscar totais por status
  getStatusTotals: async (startDate, endDate) => {
    const payments = await PaymentService.findByPeriod(startDate, endDate, true);
    return payments.reduce((acc, month) => {
      acc.total += month.total;
      acc.realizados += month.realizados;
      acc.pagos += month.pagos;
      return acc;
    }, { total: 0, realizados: 0, pagos: 0 });
  }
};
