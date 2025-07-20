import React, { useState, useEffect } from 'react';
import { PaymentService } from '../services/api';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PaymentForm from './PaymentForm';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';

const PaymentList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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

  const formatDate = (dateString, payment = null) => {
    if (!dateString) return '-';
    
    // If payment object is provided and has dataString, use it to avoid timezone issues
    if (payment && payment.dataString) {
      const [year, month, day] = payment.dataString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // If dateString is in YYYY-MM-DD format, parse it directly
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Fallback to original method for other formats
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

          {isMobile ? (
            // Mobile Card Layout
            <Box sx={{ width: '100%' }}>
              {payments.map((payment) => (
                  <Card sx={{ 
                    backgroundColor: '#fff', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderRadius: 0,
                    border: '1px solid rgba(0,0,0,0.05)',
                    borderTop: 'none',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)'
                    },
                    '&:last-child': {
                      borderRadius: '0 0 4px 4px'
                    },
                    mb: 0
                  }}>
                    <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {/* Data e Valor */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          pb: 1,
                          borderBottom: '1px solid rgba(0,0,0,0.08)'
                        }}>
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#7f8c8d', 
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                mb: 0.5
                              }}
                            >
                              Data
                            </Typography>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 600, 
                                color: '#2c3e50',
                                fontSize: '1.1rem'
                              }}
                            >
                              {formatDate(payment.data, payment)}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#7f8c8d', 
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                mb: 0.5
                              }}
                            >
                              Valor
                            </Typography>
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                fontWeight: 700, 
                                color: '#27ae60',
                                fontSize: '1.4rem'
                              }}
                            >
                              {formatCurrency(payment.valor)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* Status */}
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'row', 
                          gap: { xs: 2, sm: 3, md: 4 }, 
                          flexWrap: 'wrap',
                          justifyContent: { xs: 'center', sm: 'space-around' },
                          px: { xs: 1, sm: 2, md: 3 }
                        }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={payment.realizada}
                                onChange={() => handleStatusToggle(payment, 'realizada')}
                                sx={{
                                  color: '#bdc3c7',
                                  '&.Mui-checked': {
                                    color: '#27ae60'
                                  },
                                  '& .MuiSvgIcon-root': {
                                    fontSize: '1.3rem'
                                  }
                                }}
                              />
                            }
                            label={
                              <Typography sx={{ 
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: payment.realizada ? '#27ae60' : '#7f8c8d'
                              }}>
                                REALIZADA
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={payment.paga === 'PAGA'}
                                onChange={() => handleStatusToggle(payment, 'paga')}
                                sx={{
                                  color: '#bdc3c7',
                                  '&.Mui-checked': {
                                    color: '#27ae60'
                                  },
                                  '& .MuiSvgIcon-root': {
                                    fontSize: '1.3rem'
                                  }
                                }}
                              />
                            }
                            label={
                              <Typography sx={{ 
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: payment.paga === 'PAGA' ? '#27ae60' : '#7f8c8d'
                              }}>
                                PAGA
                              </Typography>
                            }
                          />
                        </Box>
                        
                        {/* Data Pagamento */}
                        {payment.dataPagamento && (
                          <Box sx={{ 
                            backgroundColor: 'rgba(39, 174, 96, 0.08)',
                            borderRadius: 2,
                            p: 1.5,
                            textAlign: 'center'
                          }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#27ae60',
                                fontWeight: 500,
                                fontSize: '0.875rem'
                              }}
                            >
                              💰 Pago em: {formatDate(payment.dataPagamento)}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Ações */}
                        <Box sx={{ 
                          display: 'flex', 
                          gap: { xs: 2, sm: 3, md: 4 }, 
                          justifyContent: { xs: 'center', sm: 'space-around' },
                          pt: 1,
                          px: { xs: 2, sm: 3, md: 4 }
                        }}>
                          <Button
                            variant="contained"
                            size="medium"
                            onClick={() => handleEdit(payment)}
                            sx={{
                              backgroundColor: '#3498db',
                              '&:hover': {
                                backgroundColor: '#2980b9'
                              },
                              borderRadius: 2,
                              px: 3,
                              py: 1,
                              fontWeight: 600,
                              textTransform: 'none',
                              fontSize: '0.875rem'
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="contained"
                            size="medium"
                            color="error"
                            onClick={() => handleDelete(payment.id)}
                            sx={{
                              backgroundColor: '#e74c3c',
                              '&:hover': {
                                backgroundColor: '#c0392b'
                              },
                              borderRadius: 2,
                              px: 3,
                              py: 1,
                              fontWeight: 600,
                              textTransform: 'none',
                              fontSize: '0.875rem'
                            }}
                          >
                            Excluir
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
              ))}
            </Box>
          ) : (
            // Desktop Table Layout
            <TableContainer component={Paper} sx={{ backgroundColor: '#fff' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    backgroundColor: '#6b7280',
                    '&.MuiTableRow-root': {
                      backgroundColor: '#6b7280 !important'
                    },
                    '& td, & th': {
                      backgroundColor: '#6b7280 !important'
                    }
                  }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 500, backgroundColor: '#6b7280' }}>DATA</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 500, backgroundColor: '#6b7280' }}>VALOR</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 500, backgroundColor: '#6b7280' }}>STATUS</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 500, backgroundColor: '#6b7280' }}>DATA PAGAMENTO</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 500, backgroundColor: '#6b7280' }} align="center">AÇÕES</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} sx={{ '&:nth-of-type(even)': { backgroundColor: '#f8f9fa' }, '&:nth-of-type(odd)': { backgroundColor: '#fff' } }}>
                      <TableCell sx={{ color: '#2c3e50' }}>{formatDate(payment.data, payment)}</TableCell>
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
                              backgroundColor: '#3498db',
                              '&:hover': {
                                backgroundColor: '#2980b9'
                              }
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            color="error"
                            onClick={() => handleDelete(payment.id)}
                            sx={{
                              backgroundColor: '#e74c3c',
                              '&:hover': {
                                backgroundColor: '#c0392b'
                              }
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
          )}
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

      <Paper elevation={3} sx={{ 
        p: { xs: 2, sm: 3 }, 
        mb: 3, 
        backgroundColor: '#f8f9fa',
        mx: { xs: 1, sm: 0 }
      }}>
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            textAlign: 'center', 
            color: '#2c3e50',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            fontWeight: 600,
            mb: 2
          }}
        >
          MARIA DE LOURDES NUNES DA SILVA
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 1.5, sm: 1 }, 
          alignItems: 'center' 
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <Typography sx={{ 
              color: '#34495e',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              textAlign: 'center'
            }}>
              Telefone: (11) 96346-2044
            </Typography>
            <IconButton
              href="https://wa.me/5511963462044"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#27ae60',
                '&:hover': {
                  backgroundColor: 'rgba(39, 174, 96, 0.04)'
                },
                borderRadius: '50%',
                p: { xs: 0.5, sm: 1 }
              }}
            >
              <WhatsAppIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
            </IconButton>
          </Box>
          <Typography sx={{ 
            color: '#34495e',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            textAlign: 'center',
            wordBreak: 'break-word'
          }}>
            Banco: BRADESCO AG 2894 CC 22871-0
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <Typography sx={{ 
              color: '#34495e',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              textAlign: 'center'
            }}>
              PIX (CPF): 02833633807
            </Typography>
            <IconButton
              onClick={handleCopyPix}
              sx={{
                color: '#34495e',
                '&:hover': {
                  backgroundColor: 'rgba(52, 73, 94, 0.04)'
                },
                borderRadius: '50%',
                p: { xs: 0.5, sm: 1 }
              }}
            >
              <ContentCopyIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {renderMonthlyPayments()}
    </Container>
  );
};

export default PaymentList;
