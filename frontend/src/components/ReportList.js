import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReportForm from './ReportForm';
import ReportFilters from './ReportFilters';
import PDFViewerModal from './PDFViewerModal';
import { ReportService } from '../services/reportApi';
import { generatePaymentReport } from '../utils/pdfGenerator';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
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
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const ReportList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [viewingReportPdf, setViewingReportPdf] = useState(null);
  const newReportFormRef = useRef(null);

  useEffect(() => {
    loadReports();
  }, []);

  // Update filtered reports when reports changes
  useEffect(() => {
    if (Object.keys(activeFilters).length === 0) {
      setFilteredReports(reports);
    } else {
      // Apply filters
      const filtered = reports.filter(report => {
        if (!report.date) return false;
        
        const reportDate = new Date(report.date);
        const reportDateString = format(reportDate, 'yyyy-MM-dd');
        
        if (activeFilters.date) {
          return reportDateString === activeFilters.date;
        }
        
        if (activeFilters.startDate && activeFilters.endDate) {
          return reportDateString >= activeFilters.startDate && reportDateString <= activeFilters.endDate;
        }
        
        return true;
      });
      
      setFilteredReports(filtered);
    }
  }, [reports, activeFilters]);

  const loadReports = async () => {
    try {
      // Tentar carregar dados da API
      try {
        const data = await ReportService.list();
        setReports(data);
        setFilteredReports(data);
        setLoading(false);
      } catch (apiError) {
        console.warn('API não disponível, usando dados de exemplo:', apiError);
        // Fallback para dados de exemplo se a API não estiver disponível
        const mockData = [
          {
            _id: '1',
            date: '2023-06-15',
            reportPdfUrl: '/reports/report1.pdf',
            transactionPdfUrl: '/reports/transaction1.pdf',
            createdAt: '2023-06-15T10:00:00Z'
          },
          {
            _id: '2',
            date: '2023-07-20',
            reportPdfUrl: '/reports/report2.pdf',
            transactionPdfUrl: '/reports/transaction2.pdf',
            createdAt: '2023-07-20T14:30:00Z'
          }
        ];
        
        setReports(mockData);
        setFilteredReports(mockData);
        setLoading(false);
      }
    } catch (err) {
      setError('Erro ao carregar relatórios');
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setShowEditForm(true);
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Tem certeza que deseja excluir este relatório?')) {
      try {
        try {
          // Tentar excluir via API
          await ReportService.delete(reportId);
          await loadReports(); // Recarregar a lista após exclusão
        } catch (apiError) {
          console.warn('API não disponível, simulando exclusão localmente:', apiError);
          // Fallback para exclusão local se a API não estiver disponível
          const updatedReports = reports.filter(report => report._id !== reportId);
          setReports(updatedReports);
          setFilteredReports(updatedReports.filter(report => {
            // Re-apply current filters
            if (Object.keys(activeFilters).length === 0) return true;
            
            const reportDate = new Date(report.date);
            const reportDateString = format(reportDate, 'yyyy-MM-dd');
            
            if (activeFilters.date) {
              return reportDateString === activeFilters.date;
            }
            
            if (activeFilters.startDate && activeFilters.endDate) {
              return reportDateString >= activeFilters.startDate && reportDateString <= activeFilters.endDate;
            }
            
            return true;
          }));
        }
      } catch (err) {
        setError('Erro ao excluir relatório');
      }
    }
  };

  const handleViewPdf = (report, type) => {
    // Usar a URL do PDF apropriada com base no tipo
    const pdfUrl = type === 'report' ? report.reportPdfUrl : report.transactionPdfUrl;
    
    // Definir a URL do PDF e abrir o modal
    setViewingReportPdf(pdfUrl);
    setPdfModalOpen(true);
  };

  // Função para gerar PDF de relatórios filtrados
  const handleGeneratePDF = () => {
    // Gerar o PDF usando a biblioteca jsPDF
    const doc = generatePaymentReport(filteredReports, activeFilters);
    
    // Armazenar o documento PDF gerado no estado
    setViewingReportPdf(doc);
    
    // Abrir o modal de visualização do PDF
    setPdfModalOpen(true);
  };
  
  // Função para salvar o PDF no formulário de novo relatório
  const handleSavePdfToForm = () => {
    if (!viewingReportPdf) return;
    
    try {
      // Converter o documento PDF em uma URL de dados
      const pdfDataUrl = viewingReportPdf.output('dataurlstring');
      
      // Converter a URL de dados em um arquivo Blob
      const byteString = atob(pdfDataUrl.split(',')[1]);
      const mimeType = pdfDataUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      // Criar o arquivo PDF
      const fileName = `relatorio-faxina-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      const pdfFile = new File([ab], fileName, { type: mimeType });
      
      // Fechar o modal
      setPdfModalOpen(false);
      setViewingReportPdf(null);
      
      // Abrir o formulário de novo relatório
      setEditingReport(null);
      setShowForm(true);
      
      // Salvar o arquivo no formulário (usando setTimeout para garantir que o formulário foi renderizado)
      setTimeout(() => {
        if (newReportFormRef && newReportFormRef.current) {
          newReportFormRef.current.setReportPdf(pdfFile);
          newReportFormRef.current.setReportPdfName(fileName);
        }
      }, 500);
    } catch (error) {
      console.error('Erro ao salvar PDF no formulário:', error);
    }
  };

  const handleReportUpdated = async () => {
    setShowEditForm(false);
    setEditingReport(null);
    await loadReports();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    // If dateString is in YYYY-MM-DD format, parse it directly
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Fallback to original method for other formats
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  if (showEditForm) {
    return (
      <ReportForm
        report={editingReport}
        onClose={() => setShowEditForm(false)}
        onSave={handleReportUpdated}
      />
    );
  }

  if (showForm && !showEditForm) {
    return (
      <ReportForm
        ref={newReportFormRef}
        onClose={() => setShowForm(false)}
        onSave={() => {
          setShowForm(false);
          loadReports();
        }}
      />
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* User Info Card */}
      <Box sx={{ width: '100%' }}>
        <Card sx={{ 
          mb: 3, 
          borderLeft: '4px solid #2c3e50 !important', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: '4px',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: '#2c3e50' }}>
              Maria de Lourdes Nunes da Silva
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f8c8d', mt: 0.5 }}>
              Rua Doutor Mário Pinto Serva, 142 - Jardim Paulista
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters Card */}
      <ReportFilters
        onFilterChange={handleFilterChange}
        onNewReport={() => setShowForm(true)}
        totalFiltered={filteredReports.length}
        onGeneratePDF={handleGeneratePDF}
      />

      {/* Reports List */}
      {isMobile ? (
        // Mobile Card Layout
        <Box sx={{ width: '100%' }}>
          {loading ? (
            <Typography>Carregando...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : filteredReports.length === 0 ? (
            <Typography>Nenhum relatório encontrado.</Typography>
          ) : (
            filteredReports.map((report) => (
              <Card key={report._id} sx={{ 
                backgroundColor: '#fff', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderRadius: 1,
                border: '1px solid rgba(0,0,0,0.05)',
                mb: 2,
                borderLeft: '4px solid #2c3e50 !important',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Data */}
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
                          Data do Relatório
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#2c3e50',
                            fontSize: '1.1rem'
                          }}
                        >
                          {formatDate(report.date)}
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
                          Data de Criação
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 500, 
                            color: '#2c3e50',
                            fontSize: '0.9rem'
                          }}
                        >
                          {report.createdAt ? format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Botões */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 1
                    }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewPdf(report, 'report')}
                        sx={{ 
                          borderColor: '#3498db',
                          color: '#3498db',
                          borderRadius: 1,
                          py: 0.75,
                          fontWeight: 500,
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#2980b9',
                            backgroundColor: 'rgba(52, 152, 219, 0.08)'
                          }
                        }}
                      >
                        Ver PDF do Relatório
                      </Button>
                      
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewPdf(report, 'transaction')}
                        sx={{ 
                          borderColor: '#3498db',
                          color: '#3498db',
                          borderRadius: 1,
                          py: 0.75,
                          fontWeight: 500,
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#2980b9',
                            backgroundColor: 'rgba(52, 152, 219, 0.08)'
                          }
                        }}
                      >
                        Ver PDF da Transação
                      </Button>
                    </Box>
                    
                    {/* Ações */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      mt: 1,
                      pt: 1,
                      borderTop: '1px solid rgba(0,0,0,0.08)'
                    }}>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(report)}
                        sx={{ 
                          bgcolor: '#0f172a', 
                          color: 'white',
                          borderRadius: 1,
                          py: 0.75,
                          px: 2,
                          fontWeight: 500,
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: '#1e293b'
                          }
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(report._id)}
                        sx={{ 
                          bgcolor: '#e74c3c', 
                          color: 'white',
                          borderRadius: 1,
                          py: 0.75,
                          px: 2,
                          fontWeight: 500,
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: '#c0392b'
                          }
                        }}
                      >
                        Excluir
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      ) : (
        // Desktop Table Layout
        <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
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
                  <TableCell sx={{ color: '#fff', fontWeight: 500, backgroundColor: '#6b7280' }}>Data do Relatório</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 500, backgroundColor: '#6b7280' }}>PDF do Relatório</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 500, backgroundColor: '#6b7280' }}>PDF da Transação</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 500, backgroundColor: '#6b7280' }}>Data de Criação</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 500, backgroundColor: '#6b7280' }} align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography>Carregando...</Typography>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="error">{error}</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography>Nenhum relatório encontrado.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report._id} hover>
                      <TableCell>{formatDate(report.date)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewPdf(report, 'report')}
                        >
                          Ver PDF
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewPdf(report, 'transaction')}
                        >
                          Ver PDF
                        </Button>
                      </TableCell>
                      <TableCell>
                        {report.createdAt ? format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(report)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(report._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* PDF Viewer Modal */}
      {pdfModalOpen && (
        <PDFViewerModal
          open={pdfModalOpen}
          onClose={() => {
            setPdfModalOpen(false);
            setViewingReportPdf(null);
          }}
          pdfDoc={viewingReportPdf}
          filename={`relatorio-faxina-${format(new Date(), 'yyyy-MM-dd')}.pdf`}
          onSavePdf={handleSavePdfToForm}
        />
      )}
    </Container>
  );
};

export default ReportList;
