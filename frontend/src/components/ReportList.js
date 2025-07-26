import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Dialog,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  Container,
  Grid
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReportUpload from './ReportUpload';
import { format } from 'date-fns';

// Dados de exemplo para relatórios
const sampleReports = [
  {
    id: 1,
    date: new Date('2025-07-15'),
    title: 'Relatório Mensal - Julho 2025',
    type: 'Relatório de Pagamento',
    hasReceipt: true,
    status: 'Completo'
  },
  {
    id: 2,
    date: new Date('2025-06-30'),
    title: 'Relatório Mensal - Junho 2025',
    type: 'Relatório de Pagamento',
    hasReceipt: true,
    status: 'Completo'
  },
  {
    id: 3,
    date: new Date('2025-05-31'),
    title: 'Relatório Mensal - Maio 2025',
    type: 'Relatório de Pagamento',
    hasReceipt: false,
    status: 'Pendente'
  },
  {
    id: 4,
    date: new Date('2025-04-30'),
    title: 'Relatório Mensal - Abril 2025',
    type: 'Relatório de Pagamento',
    hasReceipt: true,
    status: 'Completo'
  },
  {
    id: 5,
    date: new Date('2025-03-31'),
    title: 'Relatório Mensal - Março 2025',
    type: 'Relatório de Pagamento',
    hasReceipt: true,
    status: 'Completo'
  }
];

const ReportList = () => {
  const [reports, setReports] = useState(sampleReports);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [statusTypeExpanded, setStatusTypeExpanded] = useState(false);
  
  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText('02833633807');
      // You could add a toast notification here if desired
    } catch (err) {
      console.error('Failed to copy PIX:', err);
    }
  };

  const handleOpenUploadModal = () => {
    setOpenUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setOpenUploadModal(false);
  };

  const handleSearch = () => {
    let filteredReports = [...sampleReports];
    let filterLabels = [];
    
    switch (filterType) {
      case 'date':
        if (selectedDate) {
          const formattedDate = format(selectedDate, 'yyyy-MM-dd');
          filteredReports = filteredReports.filter(report => 
            format(report.date, 'yyyy-MM-dd') === formattedDate
          );
          filterLabels.push(`Data: ${format(selectedDate, 'dd/MM/yyyy')}`);
        }
        break;
      case 'month':
        const monthStart = new Date(selectedYear, selectedMonth, 1);
        const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
        filteredReports = filteredReports.filter(report => 
          report.date >= monthStart && report.date <= monthEnd
        );
        filterLabels.push(`Mês: ${new Date(0, selectedMonth).toLocaleString('pt-BR', { month: 'long' })}/${selectedYear}`);
        break;
      case 'year':
        const yearStart = new Date(selectedYear, 0, 1);
        const yearEnd = new Date(selectedYear, 11, 31);
        filteredReports = filteredReports.filter(report => 
          report.date >= yearStart && report.date <= yearEnd
        );
        filterLabels.push(`Ano: ${selectedYear}`);
        break;
      case 'period':
        if (startDate && endDate) {
          filteredReports = filteredReports.filter(report => 
            report.date >= startDate && report.date <= endDate
          );
          filterLabels.push(`Período: ${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`);
        }
        break;
      default:
        // Todos - não aplica filtro de data
        break;
    }
    
    // Filtrar por termo de pesquisa
    if (searchTerm) {
      filteredReports = filteredReports.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      filterLabels.push(`Busca: ${searchTerm}`);
    }
    
    // Filtrar por status
    if (statusFilter) {
      filteredReports = filteredReports.filter(report => 
        report.status === statusFilter
      );
      filterLabels.push(`Status: ${statusFilter}`);
    }
    
    // Filtrar por tipo
    if (typeFilter) {
      filteredReports = filteredReports.filter(report => 
        report.type === typeFilter
      );
      filterLabels.push(`Tipo: ${typeFilter}`);
    }
    
    setActiveFilters(filterLabels);
    setReports(filteredReports);
  };

  const handleClearFilters = () => {
    setFilterType('all');
    setSelectedDate(null);
    setStartDate(null);
    setEndDate(null);
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setActiveFilters([]);
    setReports(sampleReports);
  };

  const formatDate = (date) => {
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Card de informações da Maria de Lourdes */}
      <Box sx={{ width: '100%' }}>
        <Card sx={{ 
          mb: 3, 
          backgroundColor: '#f0f2f5 !important',
          mx: { xs: 0, sm: 0 },
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15) !important',
          border: '2px solid #d1d5db !important',
          borderRadius: '12px !important',
          borderLeft: '4px solid #2c3e50 !important'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
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
          </CardContent>
        </Card>
      </Box>

      {/* Card unificado para Filtros e Status */}
      <Card sx={{ 
        mb: 3, 
        width: '100%',
        backgroundColor: '#f0f2f5 !important',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15) !important',
        border: '2px solid #d1d5db !important',
        borderRadius: '12px !important',
        borderLeft: '4px solid #2c3e50 !important'
      }}>
        <CardContent>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              textAlign: 'center', 
              color: '#2c3e50',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              fontWeight: 600,
              mb: 3
            }}
          >
            RELATÓRIOS DE PAGAMENTO
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Seção de Filtros */}
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.main',
                  },
                  borderBottom: '1px solid #e0e0e0',
                  pb: 1
                }}
                onClick={() => setFilterExpanded(!filterExpanded)}
              >
                <FilterListIcon />
                Filtros {filterExpanded ? '▲' : '▼'}
              </Typography>
              
              {filterExpanded && (
                <Box sx={{ mt: 2 }}>
                  <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <RadioGroup
                      aria-label="filter-type"
                      name="filter-type"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      row
                    >
                      <FormControlLabel value="all" control={<Radio size="small" />} label="Todos" />
                      <FormControlLabel value="date" control={<Radio size="small" />} label="Data Específica" />
                      <FormControlLabel value="month" control={<Radio size="small" />} label="Mês" />
                      <FormControlLabel value="year" control={<Radio size="small" />} label="Ano" />
                      <FormControlLabel value="period" control={<Radio size="small" />} label="Período" />
                    </RadioGroup>
                  </FormControl>
                  
                  <Box sx={{ mt: 2, display: filterType !== 'all' ? 'block' : 'none' }}>
                    {filterType === 'date' && (
                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                        <DatePicker
                          label="Selecionar Data"
                          value={selectedDate}
                          onChange={setSelectedDate}
                          slotProps={{ textField: { size: "small", fullWidth: true } }}
                        />
                      </LocalizationProvider>
                    )}
                    
                    {filterType === 'month' && (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Mês</InputLabel>
                            <Select
                              value={selectedMonth}
                              label="Mês"
                              onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                              {Array.from({ length: 12 }, (_, i) => (
                                <MenuItem key={i} value={i}>
                                  {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Ano</InputLabel>
                            <Select
                              value={selectedYear}
                              label="Ano"
                              onChange={(e) => setSelectedYear(e.target.value)}
                            >
                              {Array.from({ length: 10 }, (_, i) => (
                                <MenuItem key={i} value={new Date().getFullYear() - i}>
                                  {new Date().getFullYear() - i}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    )}
                    
                    {filterType === 'year' && (
                      <FormControl fullWidth size="small">
                        <InputLabel>Ano</InputLabel>
                        <Select
                          value={selectedYear}
                          label="Ano"
                          onChange={(e) => setSelectedYear(e.target.value)}
                        >
                          {Array.from({ length: 10 }, (_, i) => (
                            <MenuItem key={i} value={new Date().getFullYear() - i}>
                              {new Date().getFullYear() - i}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    
                    {filterType === 'period' && (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                            <DatePicker
                              label="Data Inicial"
                              value={startDate}
                              onChange={setStartDate}
                              slotProps={{ textField: { size: "small", fullWidth: true } }}
                            />
                          </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                            <DatePicker
                              label="Data Final"
                              value={endDate}
                              onChange={setEndDate}
                              slotProps={{ textField: { size: "small", fullWidth: true } }}
                            />
                          </LocalizationProvider>
                        </Grid>
                      </Grid>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
            
            {/* Seção de Status e Tipo */}
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.main',
                  },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  borderBottom: '1px solid #e0e0e0',
                  pb: 1
                }}
                onClick={() => setStatusTypeExpanded(!statusTypeExpanded)}
              >
                Status e Tipo {statusTypeExpanded ? '▲' : '▼'}
              </Typography>
              
              {statusTypeExpanded && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="status-filter-label">Status</InputLabel>
                        <Select
                          labelId="status-filter-label"
                          id="status-filter"
                          value={statusFilter}
                          label="Status"
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <MenuItem value="">Todos</MenuItem>
                          <MenuItem value="Completo">Completo</MenuItem>
                          <MenuItem value="Pendente">Pendente</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="type-filter-label">Tipo</InputLabel>
                        <Select
                          labelId="type-filter-label"
                          id="type-filter"
                          value={typeFilter}
                          label="Tipo"
                          onChange={(e) => setTypeFilter(e.target.value)}
                        >
                          <MenuItem value="">Todos</MenuItem>
                          <MenuItem value="Relatório de Pagamento">Relatório de Pagamento</MenuItem>
                          <MenuItem value="Comprovante Bancário">Comprovante Bancário</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Buscar por título"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          </Box>
          
          {/* Botões de ação */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              size="small"
              startIcon={<FilterListIcon />}
            >
              Filtrar
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              size="small"
              sx={{ mr: 1 }}
            >
              Limpar
            </Button>
            
            {/* Botão para voltar à página de pagamentos */}
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/"
              startIcon={<ArrowBackIcon />}
              size="small"
              sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
            >
              Voltar para Pagamentos
            </Button>
          </Box>
          
          {/* Chips de filtros ativos */}
          {activeFilters.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {activeFilters.map((filter, index) => (
                <Chip 
                  key={index} 
                  label={filter} 
                  size="small" 
                  onDelete={() => {}} 
                  color="primary" 
                  variant="outlined" 
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      <Box sx={{ flexGrow: 1 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Relatórios ({reports.length})
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenUploadModal}
                size="small"
              >
                Novo Relatório
              </Button>
            </Box>
            
            {activeFilters.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {activeFilters.map((filter, index) => (
                  <Chip 
                    key={index} 
                    label={filter} 
                    size="small" 
                    onDelete={() => {}} 
                    color="primary" 
                    variant="outlined" 
                  />
                ))}
              </Box>
            )}
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Título</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.length > 0 ? (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{formatDate(report.date)}</TableCell>
                        <TableCell>{report.title}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>
                          <Chip 
                            label={report.status} 
                            color={report.status === 'Completo' ? 'success' : 'warning'} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="primary">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          {report.hasReceipt && (
                            <IconButton size="small" color="primary">
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Nenhum relatório encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Modal de Upload */}
      <Dialog open={openUploadModal} onClose={handleCloseUploadModal} maxWidth="md" fullWidth>
        <DialogContent>
          <ReportUpload onClose={handleCloseUploadModal} />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ReportList;
