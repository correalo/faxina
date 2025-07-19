require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

const convertCurrency = (valor) => {
  return parseFloat(valor.replace('R$', '').replace(',', '.').trim());
};

const convertDate = (dateStr) => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('/');
  return new Date(year, month - 1, day);
};

const importData = async (data) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado ao MongoDB');

    await Payment.deleteMany({});
    console.log('Dados existentes removidos');

    const payments = data.split('\n')
      .filter(line => line.trim())
      .slice(1)
      .map(line => {
        const [data, realizada, valor, paga, dataPagamento, observacao] = line.split('\t');
        return {
          data: convertDate(data),
          realizada: realizada || '',
          valor: convertCurrency(valor),
          paga: paga || '',
          dataPagamento: convertDate(dataPagamento),
          observacao: observacao || ''
        };
      })
      .filter(payment => payment.data);

    await Payment.insertMany(payments);
    console.log(`${payments.length} pagamentos importados com sucesso`);

  } catch (error) {
    console.error('Erro na importação:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  }
};

module.exports = importData;
