import React, { useState } from 'react';
import PaymentReport from './PaymentReport';
/* eslint-disable */
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Typography,
  Tooltip,
  TextField,
  Chip
} from '@mui/material';
/* eslint-enable */
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

const PaymentFilters = ({ onFilterChange, onSendWhatsApp, onNewPayment, totalFiltered, totalValue, filteredData }) => {
  const [filterType, setFilterType] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const applyFilter = () => {
    let filters = {};
    let filterLabels = [];

    switch (filterType) {
      case 'date':
        if (selectedDate) {
          filters.date = format(selectedDate, 'yyyy-MM-dd');
          filterLabels.push(`Data: ${format(selectedDate, 'dd/MM/yyyy')}`);
        }
        break;
      case 'month':
        const monthStart = startOfMonth(new Date(selectedYear, selectedMonth));
        const monthEnd = endOfMonth(new Date(selectedYear, selectedMonth));
        filters.startDate = format(monthStart, 'yyyy-MM-dd');
        filters.endDate = format(monthEnd, 'yyyy-MM-dd');
        filterLabels.push(`Mês: ${months[selectedMonth]}/${selectedYear}`);
        break;
      case 'year':
        const yearStart = startOfYear(new Date(selectedYear, 0));
        const yearEnd = endOfYear(new Date(selectedYear, 0));
        filters.startDate = format(yearStart, 'yyyy-MM-dd');
        filters.endDate = format(yearEnd, 'yyyy-MM-dd');
        filterLabels.push(`Ano: ${selectedYear}`);
        break;
      case 'period':
        if (startDate && endDate) {
          filters.startDate = format(startDate, 'yyyy-MM-dd');
          filters.endDate = format(endDate, 'yyyy-MM-dd');
          filterLabels.push(`Período: ${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`);
        }
        break;
      default:
        filters = {};
        filterLabels = [];
    }

    setActiveFilters(filterLabels);
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setFilterType('all');
    setSelectedDate(null);
    setStartDate(null);
    setEndDate(null);
    setActiveFilters([]);
    onFilterChange({});
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleOpenReport = () => {
    setIsReportOpen(true);
  };

  const handleCloseReport = () => {
    setIsReportOpen(false);
  };

  const getReportTitle = () => {
    switch (filterType) {
      case 'date':
        return `Pagamentos do dia ${selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}`;
      case 'month':
        return `Pagamentos de ${months[selectedMonth]} de ${selectedYear}`;
      case 'year':
        return `Pagamentos do ano de ${selectedYear}`;
      case 'period':
        return `Pagamentos de ${startDate ? format(startDate, 'dd/MM/yyyy') : ''} até ${endDate ? format(endDate, 'dd/MM/yyyy') : ''}`;
      default:
        return 'Todos os Pagamentos';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            Filtros e Relatórios
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo de Filtro</InputLabel>
                <Select
                  value={filterType}
                  label="Tipo de Filtro"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="date">Data Específica</MenuItem>
                  <MenuItem value="month">Mês</MenuItem>
                  <MenuItem value="year">Ano</MenuItem>
                  <MenuItem value="period">Período Personalizado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {filterType === 'date' && (
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Selecionar Data"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />
              </Grid>
            )}

            {filterType === 'month' && (
              <>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Mês</InputLabel>
                    <Select
                      value={selectedMonth}
                      label="Mês"
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      {months.map((month, index) => (
                        <MenuItem key={index} value={index}>{month}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Ano</InputLabel>
                    <Select
                      value={selectedYear}
                      label="Ano"
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {filterType === 'year' && (
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ano</InputLabel>
                  <Select
                    value={selectedYear}
                    label="Ano"
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {filterType === 'period' && (
              <>
                <Grid item xs={12} sm={6} md={2}>
                  <DatePicker
                    label="Data Inicial"
                    value={startDate}
                    onChange={setStartDate}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <DatePicker
                    label="Data Final"
                    value={endDate}
                    onChange={setEndDate}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6} md={2}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={applyFilter}
                  startIcon={<FilterIcon />}
                  size="small"
                  disabled={filterType === 'all'}
                >
                  Filtrar
                </Button>
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                  size="small"
                  disabled={activeFilters.length === 0}
                >
                  Limpar
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {/* Filtros Ativos */}
          {activeFilters.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Filtros ativos:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {activeFilters.map((filter, index) => (
                  <Chip
                    key={index}
                    label={filter}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Resumo e Ações */}
          {totalFiltered !== undefined && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Resultados:</strong> {totalFiltered} pagamento(s)
                  </Typography>
                  <Typography variant="body2">
                    <strong>Valor Total:</strong> {formatCurrency(totalValue || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={onNewPayment}
                      size="small"
                      sx={{
                        backgroundColor: '#27ae60',
                        '&:hover': {
                          backgroundColor: '#219a52'
                        }
                      }}
                    >
                      + Novo Pagamento
                    </Button>



                    <Button
                      variant="contained"
                      startIcon={<PdfIcon />}
                      onClick={handleOpenReport}
                      disabled={totalFiltered === 0}
                      size="small"
                      sx={{
                        backgroundColor: '#d32f2f',
                        '&:hover': {
                          backgroundColor: '#b71c1c'
                        }
                      }}
                    >
                      Visualizar PDF
                    </Button>
                    
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
      

      {/* Modal de relatório de pagamentos */}
      <PaymentReport
        open={isReportOpen}
        onClose={handleCloseReport}
        payments={filteredData}
        title={getReportTitle()}
        totalValue={totalValue}
      />
    </LocalizationProvider>
  );
};

export default PaymentFilters;
