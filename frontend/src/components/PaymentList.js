import React, { useState, useEffect } from 'react';
import { PaymentService } from '../services/api';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PaymentForm from './PaymentForm';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Box,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';

const PaymentList = () => {
  
  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText('02833633807');
      // You could add a toast notification here if desired
    } catch (err) {
      console.error('Failed to copy PIX:', err);
    }
  };

  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await PaymentService.list();
      setMonthlyPayments(data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar pagamentos');
      setLoading(false);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setShowEditForm(true);
  };

  const handleDelete = async (paymentId) => {
    if (window.confirm('Tem certeza que deseja excluir este pagamento?')) {
      try {
        await PaymentService.delete(paymentId);
        await loadPayments();
      } catch (err) {
        setError('Erro ao excluir pagamento');
      }
    }
  };

  const handlePaymentUpdated = async () => {
    setShowEditForm(false);
    setEditingPayment(null);
    await loadPayments();
  };

  const handleStatusToggle = async (payment, field) => {
    try {
      const update = {
        realizada: field === 'realizada' ? !payment.realizada : payment.realizada,
        paga: field === 'paga' ? (payment.paga === 'PAGA' ? '' : 'PAGA') : payment.paga
      };
      await PaymentService.updateStatus(payment.id, update);
      await loadPayments();
    } catch (err) {
      setError('Erro ao atualizar status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (showEditForm) {
    return (
      <PaymentForm
        payment={editingPayment}
        onClose={() => setShowEditForm(false)}
        onSave={handlePaymentUpdated}
      />
    );
  }

  if (showForm) {
    return (
      <PaymentForm
        onClose={() => setShowForm(false)}
        onSave={() => {
          setShowForm(false);
          loadPayments();
        }}
      />
    );
  }

  const renderMonthlyPayments = () => {
    if (loading) return <Typography>Carregando...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!monthlyPayments || monthlyPayments.length === 0) {
      return <Typography>Nenhum pagamento encontrado.</Typography>;
    }

    return monthlyPayments.map(({ month, payments, total }) => {
      // Parse the ISO date string from the backend using date-fns parseISO
      const date = parseISO(month);
      
      return (
        <Box key={month} sx={{ mb: 4 }}>
          <Box sx={{ backgroundColor: '#0f172a', p: 2, borderRadius: '4px 4px 0 0', mb: 0, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <Typography variant="h6" sx={{ color: '#fff', textTransform: 'capitalize', m: 0 }}>
              {format(date, 'MMMM yyyy', { locale: ptBR })}
            </Typography>
          </Box>

          <TableContainer component={Paper} sx={{ backgroundColor: '#fff' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#0f172a' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 500 }}>DATA</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 500 }}>VALOR</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 500 }}>STATUS</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 500 }}>DATA PAGAMENTO</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 500 }} align="center">AÇÕES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} sx={{ '&:nth-of-type(even)': { backgroundColor: '#f8f9fa' }, '&:nth-of-type(odd)': { backgroundColor: '#fff' } }}>
                    <TableCell sx={{ color: '#2c3e50' }}>{formatDate(payment.data)}</TableCell>
                    <TableCell sx={{ color: '#2c3e50' }}>{formatCurrency(payment.valor)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={payment.realizada}
                              onChange={() => handleStatusToggle(payment, 'realizada')}
                              sx={{
                                color: '#95a5a6',
                                '&.Mui-checked': {
                                  color: '#27ae60'
                                }
                              }}
                            />
                          }
                          label="REALIZADA"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={payment.paga === 'PAGA'}
                              onChange={() => handleStatusToggle(payment, 'paga')}
                              sx={{
                                color: '#95a5a6',
                                '&.Mui-checked': {
                                  color: '#27ae60'
                                }
                              }}
                            />
                          }
                          label="PAGA"
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#2c3e50' }}>{payment.dataPagamento ? formatDate(payment.dataPagamento) : '-'}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleEdit(payment)}
                          sx={{
                            backgroundColor: '#27ae60',
                            '&:hover': {
                              backgroundColor: '#219a52'
                            },
                            borderRadius: 2
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(payment.id)}
                          sx={{
                            backgroundColor: '#e74c3c',
                            '&:hover': {
                              backgroundColor: '#c0392b'
                            },
                            borderRadius: 2
                          }}
                        >
                          Excluir
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: '#0f172a' }}>
                  <TableCell colSpan={2} sx={{ fontWeight: 'bold', color: '#fff' }}>Total do Mês:</TableCell>
                  <TableCell colSpan={3} sx={{ fontWeight: 'bold', color: '#fff' }}>{formatCurrency(total)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      );
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => setShowForm(true)}
          sx={{
            backgroundColor: '#27ae60',
            '&:hover': {
              backgroundColor: '#219a52'
            },
            borderRadius: 2
          }}
        >
          + Novo Pagamento
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', color: '#2c3e50' }}>
          MARIA DE LOURDES NUNES DA SILVA
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ color: '#34495e' }}>Telefone: (11) 96346-2044</Typography>
            <IconButton
              href="https://wa.me/5511963462044"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#27ae60',
                '&:hover': {
                  backgroundColor: 'rgba(39, 174, 96, 0.04)'
                },
                borderRadius: '50%'
              }}
            >
              <WhatsAppIcon />
            </IconButton>
          </Box>
          <Typography sx={{ color: '#34495e' }}>Banco: BRADESCO AG 2894 CC 22871-0</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ color: '#34495e' }}>PIX (CPF): 02833633807</Typography>
            <IconButton
              onClick={handleCopyPix}
              sx={{
                color: '#34495e',
                '&:hover': {
                  backgroundColor: 'rgba(52, 73, 94, 0.04)'
                },
                borderRadius: '50%'
              }}
            >
              <ContentCopyIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {renderMonthlyPayments()}
    </Container>
  );
};

export default PaymentList;
