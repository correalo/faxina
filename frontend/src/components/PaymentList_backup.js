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
    
    try {
      // Handle different date formats from backend
      let date;
      
      // If it's already in YYYY-MM-DD format, parse as local date
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Parse YYYY-MM-DD as local date
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day); // month is 0-indexed
      }
      // If it's ISO format, extract just the date part and parse as local
      else if (typeof dateString === 'string' && dateString.includes('T')) {
        // Extract YYYY-MM-DD from ISO string like "2024-07-18T00:00:00.000Z"
        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        date = new Date(year, month - 1, day); // month is 0-indexed
      }
      else {
        // Fallback to regular Date constructor
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return '-';
      }
      
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '-';
    }
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

          {/* Desktop Table */}
          <Box sx={{ 
            '@media (max-width: 768px)': {
              display: 'none'
            }
          }}>
            <TableContainer component={Paper} sx={{ backgroundColor: '#fff' }}>
              <Table>
              <TableHead sx={{ backgroundColor: '#6b7280 !important' }}>
                <TableRow sx={{ backgroundColor: '#6b7280 !important' }}>
                  <TableCell sx={{ 
                    color: '#fff', 
                    fontWeight: 500, 
                    backgroundColor: '#6b7280 !important',
                    '@media (max-width: 768px)': {
                      fontSize: '0.75rem',
                      padding: '8px 4px',
                      minWidth: '60px'
                    }
                  }}>DATA</TableCell>
                  <TableCell sx={{ 
                    color: '#fff', 
                    fontWeight: 500, 
                    backgroundColor: '#6b7280 !important',
                    '@media (max-width: 768px)': {
                      fontSize: '0.75rem',
                      padding: '8px 4px',
                      minWidth: '70px'
                    }
                  }}>VALOR</TableCell>
                  <TableCell sx={{ 
                    color: '#fff', 
                    fontWeight: 500, 
                    backgroundColor: '#6b7280 !important',
                    '@media (max-width: 768px)': {
                      fontSize: '0.75rem',
                      padding: '8px 4px',
                      minWidth: '120px'
                    }
                  }}>STATUS</TableCell>
                  <TableCell sx={{ 
                    color: '#fff', 
                    fontWeight: 500, 
                    backgroundColor: '#6b7280 !important',
                    '@media (max-width: 768px)': {
                      fontSize: '0.75rem',
                      padding: '8px 4px',
                      minWidth: '80px'
                    }
                  }}>DATA PAGTO</TableCell>
                  <TableCell sx={{ 
                    color: '#fff', 
                    fontWeight: 500, 
                    backgroundColor: '#6b7280 !important',
                    '@media (max-width: 768px)': {
                      fontSize: '0.75rem',
                      padding: '8px 4px',
                      minWidth: '100px'
                    }
                  }} align="center">AÇÕES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} sx={{ '&:nth-of-type(even)': { backgroundColor: '#f8f9fa' }, '&:nth-of-type(odd)': { backgroundColor: '#fff' } }}>
                    <TableCell sx={{ 
                      color: '#2c3e50',
                      '@media (max-width: 768px)': {
                        fontSize: '0.75rem',
                        padding: '8px 4px'
                      }
                    }}>{formatDate(payment.data)}</TableCell>
                    <TableCell sx={{ 
                      color: '#2c3e50',
                      '@media (max-width: 768px)': {
                        fontSize: '0.75rem',
                        padding: '8px 4px'
                      }
                    }}>{formatCurrency(payment.valor)}</TableCell>
                    <TableCell sx={{
                      '@media (max-width: 768px)': {
                        padding: '4px 2px'
                      }
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 1,
                        '@media (max-width: 768px)': {
                          gap: 0.5
                        }
                      }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={payment.realizada}
                              onChange={() => handleStatusToggle(payment, 'realizada')}
                              sx={{
                                color: '#95a5a6',
                                '&.Mui-checked': {
                                  color: '#27ae60'
                                },
                                '@media (max-width: 768px)': {
                                  padding: '4px',
                                  '& .MuiSvgIcon-root': {
                                    fontSize: '1.1rem'
                                  }
                                }
                              }}
                            />
                          }
                          label="REALIZADA"
                          sx={{
                            '@media (max-width: 768px)': {
                              margin: 0,
                              '& .MuiFormControlLabel-label': {
                                fontSize: '0.7rem'
                              }
                            }
                          }}
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
                                },
                                '@media (max-width: 768px)': {
                                  padding: '4px',
                                  '& .MuiSvgIcon-root': {
                                    fontSize: '1.1rem'
                                  }
                                }
                              }}
                            />
                          }
                          label="PAGA"
                          sx={{
                            '@media (max-width: 768px)': {
                              margin: 0,
                              '& .MuiFormControlLabel-label': {
                                fontSize: '0.7rem'
                              }
                            }
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#2c3e50',
                      '@media (max-width: 768px)': {
                        fontSize: '0.75rem',
                        padding: '8px 4px'
                      }
                    }}>{payment.dataPagamento ? formatDate(payment.dataPagamento) : '-'}</TableCell>
                    <TableCell align="center" sx={{
                      '@media (max-width: 768px)': {
                        padding: '4px 2px'
                      }
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        justifyContent: 'center',
                        '@media (max-width: 768px)': {
                          gap: 0.5,
                          flexDirection: 'column'
                        }
                      }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleEdit(payment)}
                          sx={{
                            backgroundColor: '#27ae60',
                            '&:hover': {
                              backgroundColor: '#219a52'
                            },
                            borderRadius: 2,
                            '@media (max-width: 768px)': {
                              fontSize: '0.7rem',
                              padding: '4px 8px',
                              minWidth: '60px'
                            }
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
                            borderRadius: 2,
                            '@media (max-width: 768px)': {
                              fontSize: '0.7rem',
                              padding: '4px 8px',
                              minWidth: '60px'
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
      </Box>

      {/* Mobile Card Layout */}
      <Box sx={{ 
        '@media (min-width: 769px)': {
          display: 'none'
        }
      }}>
        {payments.map((payment) => (
          <Paper key={payment.id} sx={{ 
            mb: 2, 
            p: 2, 
            backgroundColor: '#fff',
            borderRadius: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {/* Data */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#6b7280' }}>DATA:</Typography>
              <Typography variant="body2" sx={{ color: '#2c3e50' }}>{formatDate(payment.data)}</Typography>
            </Box>
            
            {/* Valor */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#6b7280' }}>VALOR:</Typography>
              <Typography variant="body2" sx={{ color: '#2c3e50', fontWeight: 500 }}>{formatCurrency(payment.valor)}</Typography>
            </Box>
            
            {/* Status */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#6b7280', mb: 1 }}>STATUS:</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={payment.realizada}
                      onChange={() => handleStatusToggle(payment, 'realizada')}
                      sx={{
                        color: '#95a5a6',
                        '&.Mui-checked': {
                          color: '#27ae60'
                        },
                        padding: '4px'
                      }}
                    />
                  }
                  label="REALIZADA"
                  sx={{
                    margin: 0,
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.8rem'
                    }
                  }}
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
                        },
                        padding: '4px'
                      }}
                    />
                  }
                  label="PAGA"
                  sx={{
                    margin: 0,
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.8rem'
                    }
                  }}
                />
              </Box>
            </Box>
            
            {/* Data Pagamento */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#6b7280' }}>DATA PAGTO:</Typography>
              <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                {payment.dataPagamento ? formatDate(payment.dataPagamento) : '-'}
              </Typography>
            </Box>
            
            {/* Ações */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', pt: 1, borderTop: '1px solid #e5e7eb' }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleEdit(payment)}
                sx={{
                  backgroundColor: '#27ae60',
                  '&:hover': {
                    backgroundColor: '#219a52'
                  },
                  borderRadius: 2,
                  flex: 1
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
                  borderRadius: 2,
                  flex: 1
                }}
              >
                Excluir
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>
    );
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
