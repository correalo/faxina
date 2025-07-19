import React, { useState } from 'react';
import { PaymentService } from '../services/api';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const PaymentForm = ({ payment, onClose, onSave }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState(() => {
    if (payment) {
      // If editing, convert backend value (cents) to display value
      const valor = payment.valor ? (payment.valor / 100).toFixed(2).replace('.', ',') : '';
      return {
        ...payment,
        valor
      };
    }
    return {
      data: '',
      valor: '',
      realizada: false,
      paga: '',
      observacao: '',
      dataPagamento: null
    };
  });
  const [error, setError] = useState(null);

  const formatCurrency = (value) => {
    if (!value) return '';
    // Convert to number (value is in decimal format with comma)
    const number = parseFloat(value.replace(',', '.'));
    if (isNaN(number)) return '';
    // Format as BRL
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'valor') {
      // Remove non-digit characters except comma
      const cleaned = value.replace(/[^0-9,]/g, '');
      
      // Handle decimal input
      const parts = cleaned.split(',');
      if (parts.length > 2) return; // Don't allow multiple commas
      
      // Keep only up to 2 decimal places
      if (parts[1] && parts[1].length > 2) {
        parts[1] = parts[1].slice(0, 2);
      }
      
      // Join back with comma
      const final = parts.join(',');
      
      setFormData(prev => ({
        ...prev,
        [name]: final
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format valor for backend (send as decimal number)
      const submitData = {
        data: formData.data,
        valor: formData.valor ? parseFloat(formData.valor.replace(',', '.')) : 0,
        // Campos opcionais com lógica pragmática
        realizada: formData.realizada !== undefined ? formData.realizada : false,
        paga: formData.paga || 'PAGA', // Usar valor que funciona no sistema atual
        observacao: formData.observacao !== undefined ? formData.observacao : '',
        dataPagamento: formData.dataPagamento || null
      };
      if (payment?.id) {
        await PaymentService.update(payment.id, submitData);
      } else {
        await PaymentService.create(submitData);
      }
      setError(null);
      onSave?.();
      // Reset form if creating new
      if (!payment) {
        setFormData({
          data: '',
          valor: '',
          realizada: false,
          paga: '',
          observacao: '',
          dataPagamento: null
        });
      }
    } catch (err) {
      setError('Erro ao criar pagamento');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{
        p: isMobile ? 2 : 3,
        mt: 2,
        width: '100%',
        maxWidth: '100%'
      }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? 1 : 2
          }}
        >
          <Typography variant="h5" gutterBottom align="center" sx={{
            fontSize: isMobile ? '1.25rem' : '1.5rem'
          }}>
            {payment ? 'Editar Pagamento' : 'Novo Pagamento'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            type="date"
            id="data"
            name="data"
            label="Data"
            value={formData.data}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              mb: isMobile ? 1 : 2,
              '& .MuiInputBase-root': {
                height: isMobile ? '40px' : '56px'
              }
            }}
          />

          <TextField
            fullWidth
            id="valor"
            name="valor"
            label="Valor"
            value={formData.valor}
            onChange={handleChange}
            placeholder="0,00"
            required
            size={isMobile ? 'small' : 'medium'}
            sx={{
              mb: isMobile ? 0.5 : 1,
              '& .MuiInputBase-root': {
                height: isMobile ? '40px' : '56px'
              }
            }}
          />

          {formData.valor && (
            <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
              {formatCurrency(formData.valor)}
            </Typography>
          )}

          <Box sx={{
            mb: isMobile ? 1 : 2,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 1
          }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.realizada}
                  onChange={handleChange}
                  name="realizada"
                  size={isMobile ? 'small' : 'medium'}
                />
              }
              label={<Typography variant={isMobile ? 'body2' : 'body1'}>REALIZADA</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.paga === 'PAGA'}
                  onChange={(e) => {
                    const isPaga = e.target.checked;
                    setFormData(prev => ({
                      ...prev,
                      paga: isPaga ? 'PAGA' : '',
                      dataPagamento: isPaga ? new Date().toISOString().split('T')[0] : null
                    }));
                  }}
                  name="paga"
                  size={isMobile ? 'small' : 'medium'}
                />
              }
              label={<Typography variant={isMobile ? 'body2' : 'body1'}>PAGA</Typography>}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={isMobile ? 2 : 3}
            id="observacao"
            name="observacao"
            label="Observação"
            value={formData.observacao}
            onChange={handleChange}
            size={isMobile ? 'small' : 'medium'}
            sx={{ mb: isMobile ? 2 : 3 }}
          />

          <Box display="flex" gap={isMobile ? 1 : 2} justifyContent="flex-end" flexDirection={isMobile ? 'column' : 'row'} width="100%">
            <Button
              variant="outlined"
              color="error"
              onClick={onClose}
              startIcon={<CancelIcon />}
              fullWidth={isMobile}
              size={isMobile ? 'small' : 'medium'}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              fullWidth={isMobile}
              size={isMobile ? 'small' : 'medium'}
            >
              {payment?.id ? 'Atualizar Pagamento' : 'Salvar Pagamento'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PaymentForm;
