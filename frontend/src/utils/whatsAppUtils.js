import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value) => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const calculateTotal = (payments) => {
  return payments.reduce((total, payment) => total + (payment.valor || 0), 0);
};

const calculateStatistics = (payments) => {
  const realizadas = payments.filter(p => p.realizada).length;
  const pagas = payments.filter(p => p.paga === 'PAGA').length;
  const total = payments.length;
  
  const realizadasPercentage = total > 0 ? Math.round((realizadas / total) * 100) : 0;
  const pagasPercentage = total > 0 ? Math.round((pagas / total) * 100) : 0;
  
  const totalValor = payments.reduce((acc, p) => acc + (p.valor || 0), 0);
  const valorMedio = total > 0 ? totalValor / total : 0;
  
  return {
    realizadas,
    pagas,
    realizadasPercentage,
    pagasPercentage,
    valorMedio,
    total
  };
};

export const generateWhatsAppMessage = (payments, filters = {}) => {
  const stats = calculateStatistics(payments);
  const filterText = getFilterDescription(filters);
  
  let message = `🧹 *RELATÓRIO FAXINA*\n\n`;
  
  if (filterText) {
    message += `📅 *Período:* ${filterText}\n\n`;
  }
  
  message += `📊 *RESUMO:*\n`;
  message += `• Total de faxinas: ${stats.total}\n`;
  message += `• Realizadas: ${stats.realizadas} (${stats.percentualRealizadas}%)\n`;
  message += `• Pagas: ${stats.pagas} (${stats.percentualPagas}%)\n\n`;
  
  message += `💰 *VALORES:*\n`;
  message += `• Total: ${formatCurrency(stats.valorTotal)}\n`;
  message += `• Recebido: ${formatCurrency(stats.valorRecebido)}\n`;
  message += `• Pendente: ${formatCurrency(stats.valorPendente)}\n\n`;
  
  message += `📱 Relatório gerado pelo Sistema Faxina\n`;
  message += `🕐 ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`;
  
  return encodeURIComponent(message);
};

const getFilterDescription = (filters) => {
  if (filters.date) {
    return format(new Date(filters.date), 'dd/MM/yyyy');
  } else if (filters.startDate && filters.endDate) {
    return `${format(new Date(filters.startDate), 'dd/MM/yyyy')} a ${format(new Date(filters.endDate), 'dd/MM/yyyy')}`;
  }
  return '';
};

export const openWhatsApp = (message, phoneNumber = '') => {
  const baseUrl = phoneNumber 
    ? `https://wa.me/${phoneNumber}?text=${message}`
    : `https://wa.me/?text=${message}`;
  
  window.open(baseUrl, '_blank');
};
