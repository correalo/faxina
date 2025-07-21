import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const generatePaymentReport = (payments, filters = {}) => {
  const doc = new jsPDF();
  
  // Configurações
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = 30;
  
  // Cabeçalho
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80); // #2c3e50
  doc.text('RELATÓRIO DE PAGAMENTOS', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;
  
  doc.setFontSize(16);
  doc.setTextColor(52, 73, 94); // #34495e
  doc.text('Sistema Faxina', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;
  
  // Linha separadora
  doc.setDrawColor(189, 195, 199);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;
  
  // Informações do relatório
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  const reportInfo = [
    `Data de Geração: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
    `Total de Registros: ${payments.length}`,
    `Valor Total: ${formatCurrency(calculateTotal(payments))}`
  ];
  
  // Adicionar informações do filtro
  if (filters.date) {
    reportInfo.push(`Filtro: Data específica - ${format(new Date(filters.date), 'dd/MM/yyyy')}`);
  } else if (filters.startDate && filters.endDate) {
    reportInfo.push(`Filtro: Período - ${format(new Date(filters.startDate), 'dd/MM/yyyy')} a ${format(new Date(filters.endDate), 'dd/MM/yyyy')}`);
  }
  
  reportInfo.forEach((info) => {
    doc.text(info, margin, yPosition);
    yPosition += 8;
  });
  
  yPosition += 15;
  
  // Cabeçalho da tabela
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(52, 73, 94);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  
  const headers = ['#', 'Data', 'Valor', 'Realizada', 'Paga', 'Data Pagamento'];
  const colWidths = [15, 30, 30, 25, 25, 35];
  let xPosition = margin + 2;
  
  headers.forEach((header, index) => {
    doc.text(header, xPosition, yPosition + 5);
    xPosition += colWidths[index];
  });
  
  yPosition += 12;
  
  // Dados da tabela
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  
  payments.forEach((payment, index) => {
    if (yPosition > pageHeight - 40) {
      // Nova página se necessário
      doc.addPage();
      yPosition = 30;
    }
    
    // Linha alternada
    if (index % 2 === 0) {
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 10, 'F');
    }
    
    xPosition = margin + 2;
    const rowData = [
      (index + 1).toString(),
      payment.data ? format(new Date(payment.data), 'dd/MM/yyyy') : 'N/A',
      formatCurrency(payment.valor || 0),
      payment.realizada ? 'Sim' : 'Não',
      payment.paga === 'PAGA' ? 'Sim' : 'Não',
      payment.dataPagamento ? format(new Date(payment.dataPagamento), 'dd/MM/yyyy') : 'N/A'
    ];
    
    rowData.forEach((data, colIndex) => {
      doc.text(data, xPosition, yPosition + 5);
      xPosition += colWidths[colIndex];
    });
    
    yPosition += 10;
  });
  
  yPosition += 20;
  
  // Estatísticas
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 30;
  }
  
  const stats = calculateStatistics(payments);
  
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
  doc.text('RESUMO ESTATÍSTICO', margin, yPosition);
  yPosition += 15;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const statsInfo = [
    `Total de Faxinas: ${stats.total}`,
    `Faxinas Realizadas: ${stats.realizadas} (${stats.percentualRealizadas}%)`,
    `Faxinas Pagas: ${stats.pagas} (${stats.percentualPagas}%)`,
    `Valor Total: ${formatCurrency(stats.valorTotal)}`,
    `Valor Recebido: ${formatCurrency(stats.valorRecebido)}`,
    `Valor Pendente: ${formatCurrency(stats.valorPendente)}`
  ];
  
  statsInfo.forEach((stat) => {
    doc.text(stat, margin, yPosition);
    yPosition += 8;
  });
  
  // Rodapé
  doc.setFontSize(8);
  doc.setTextColor(127, 140, 141);
  doc.text('Relatório gerado pelo Sistema Faxina', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text('Página 1', pageWidth - margin, pageHeight - 15, { align: 'right' });
  
  return doc;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

const calculateTotal = (payments) => {
  return payments.reduce((total, payment) => total + (payment.valor || 0), 0);
};

const calculateStatistics = (payments) => {
  const total = payments.length;
  const realizadas = payments.filter(p => p.realizada).length;
  const pagas = payments.filter(p => p.paga).length;
  const valorTotal = calculateTotal(payments);
  const valorRecebido = payments
    .filter(p => p.paga)
    .reduce((total, payment) => total + (payment.valor || 0), 0);
  const valorPendente = valorTotal - valorRecebido;
  
  return {
    total,
    realizadas,
    pagas,
    percentualRealizadas: total > 0 ? Math.round((realizadas / total) * 100) : 0,
    percentualPagas: total > 0 ? Math.round((pagas / total) * 100) : 0,
    valorTotal,
    valorRecebido,
    valorPendente
  };
};

export const downloadPDF = (doc, filename = 'relatorio-pagamentos.pdf') => {
  doc.save(filename);
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
