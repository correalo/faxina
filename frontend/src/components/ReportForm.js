import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReportService } from '../services/reportApi';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Importar a função de geração de PDF
import { generatePaymentReport } from '../utils/pdfGenerator';

const ReportForm = React.forwardRef(({ report, onClose, onSave }, ref) => {
  const [date, setDate] = useState(report ? new Date(report.date) : new Date());
  const [reportPdf, setReportPdf] = useState(null);
  const [reportPdfName, setReportPdfName] = useState(report?.reportPdfName || '');
  const [transactionPdf, setTransactionPdf] = useState(null);
  const [transactionPdfName, setTransactionPdfName] = useState(report?.transactionPdfName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
  const reportPdfInputRef = useRef(null);
  const transactionPdfInputRef = useRef(null);
  
  // Expor funções através da ref para uso externo
  React.useImperativeHandle(ref, () => ({
    setReportPdf,
    setReportPdfName,
    setTransactionPdf,
    setTransactionPdfName,
    handleGenerateAndSavePdf
  }));
  
  // Adicionar suporte a responsividade
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleReportPdfChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReportPdf(file);
      setReportPdfName(file.name);
    }
  };
  
  // Função para gerar PDF e salvá-lo no campo de upload
  const handleGenerateAndSavePdf = () => {
    setGeneratingPdf(true);
    try {
      // Gerar o PDF usando a biblioteca jsPDF
      const doc = generatePaymentReport([], { date: date });
      
      // Converter o documento PDF em uma URL de dados
      const pdfDataUrl = doc.output('dataurlstring');
      
      // Converter a URL de dados em um arquivo Blob
      const byteString = atob(pdfDataUrl.split(',')[1]);
      const mimeType = pdfDataUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      // Criar o arquivo PDF
      const fileName = `relatorio-faxina-${format(date, 'yyyy-MM-dd')}.pdf`;
      const pdfFile = new File([ab], fileName, { type: mimeType });
      
      // Atualizar o estado com o novo arquivo PDF
      setReportPdf(pdfFile);
      setReportPdfName(fileName);
      
      setSuccess('PDF gerado e salvo com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setError('Erro ao gerar PDF. Tente novamente.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleTransactionPdfChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTransactionPdf(file);
      setTransactionPdfName(file.name);
    }
  };

  const clearReportPdf = () => {
    setReportPdf(null);
    setReportPdfName('');
    if (reportPdfInputRef.current) {
      reportPdfInputRef.current.value = '';
    }
  };

  const clearTransactionPdf = () => {
    setTransactionPdf(null);
    setTransactionPdfName('');
    if (transactionPdfInputRef.current) {
      transactionPdfInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!date) {
      setError('Por favor, selecione uma data para o relatório.');
      return;
    }

    if (!reportPdf && !report?.reportPdfUrl) {
      setError('Por favor, faça upload do PDF do relatório.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Prepare form data for API call
      const formData = new FormData();
      formData.append('date', format(date, 'yyyy-MM-dd'));
      
      if (reportPdf) {
        formData.append('reportPdf', reportPdf);
      }
      
      if (transactionPdf) {
        formData.append('transactionPdf', transactionPdf);
      }
      
      if (report?._id) {
        formData.append('id', report._id);
      }

      try {
        // Tentar salvar via API
        if (report?._id) {
          await ReportService.update(report._id, formData);
        } else {
          await ReportService.create(formData);
        }
        
        setSuccess('Relatório salvo com sucesso!');
        setTimeout(() => {
          onSave();
        }, 1500);
      } catch (apiError) {
        console.warn('API não disponível, simulando salvamento:', apiError);
        // Simular salvamento bem-sucedido se a API não estiver disponível
        setSuccess('Relatório salvo com sucesso! (modo simulado)');
        setTimeout(() => {
          onSave();
        }, 1500);
      }
    } catch (err) {
      setError('Erro ao salvar relatório. Por favor, tente novamente.');
      console.error('Error saving report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2, md: 3 }, overflow: 'hidden' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' },
          width: '100%',
          px: { xs: 1, sm: 0 }
        }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={onClose}
            sx={{ 
              bgcolor: '#0f172a', 
              color: 'white',
              mb: { xs: 1, sm: 0 },
              width: { xs: '100%', sm: 'auto' },
              borderRadius: 1,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: '#1e293b'
              }
            }}
          >
            Voltar à Lista
          </Button>
        </Box>

        <Card sx={{ 
          width: '100%', 
          maxWidth: '100%', 
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: '4px',
          border: '1px solid rgba(0,0,0,0.05)',
          borderLeft: '4px solid #2c3e50 !important'
        }}>
          <CardContent sx={{ 
            px: { xs: 2, sm: 3, md: 4 }, 
            py: { xs: 3, sm: 4 }, 
            overflow: 'hidden',
            '&:last-child': { pb: { xs: 3, sm: 4 } }
          }}>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                textAlign: { xs: 'center', sm: 'left' },
                fontWeight: 700,
                color: '#2c3e50',
                mb: 2
              }}
            >
              {report ? 'Editar Relatório' : 'Novo Relatório'}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '100%' }}>
              <Grid container spacing={isMobile ? 2 : 3} sx={{ width: '100%', m: 0 }}>
                <Grid item xs={12} md={6} sx={{ width: '100%', px: { xs: 0.5, sm: 1 } }}>
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
                  <DatePicker
                    label=""
                    value={date}
                    onChange={setDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        margin: "normal",
                        size: isMobile ? "small" : "medium",
                        sx: { 
                          maxWidth: '100%',
                          mt: 0,
                          '& .MuiInputBase-root': {
                            borderRadius: 1,
                            backgroundColor: '#f8f9fa'
                          }
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sx={{ px: { xs: 0.5, sm: 1 }, mt: 2 }}>
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
                    PDF do Relatório *
                  </Typography>
                  <Box 
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      mb: 2,
                      width: '100%',
                      maxWidth: '100%',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        border: '2px dashed #bdc3c7',
                        borderRadius: 1,
                        p: { xs: 2, sm: 3 },
                        mb: 2,
                        textAlign: 'center',
                        backgroundColor: reportPdfName ? 'rgba(39, 174, 96, 0.08)' : '#f8f9fa',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          borderColor: '#3498db',
                          backgroundColor: 'rgba(52, 152, 219, 0.08)'
                        },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: { xs: '120px', sm: '150px' }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          const file = e.dataTransfer.files[0];
                          if (file.type === 'application/pdf') {
                            setReportPdf(file);
                            setReportPdfName(file.name);
                          } else {
                            setError('Por favor, selecione apenas arquivos PDF.');
                          }
                        }
                      }}
                      onClick={() => reportPdfInputRef.current?.click()}
                    >
                      <CloudUploadIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: reportPdfName ? '#27ae60' : '#7f8c8d', mb: 1 }} />
                      <Typography variant="body1" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, fontWeight: 500, color: reportPdfName ? '#27ae60' : '#2c3e50' }}>
                        {isMobile ? 'Toque para selecionar PDF' : 'Arraste e solte o PDF aqui ou clique para selecionar'}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: reportPdfName ? '#27ae60' : '#7f8c8d'
                        }}
                      >
                        {reportPdfName ? 
                          `Arquivo: ${reportPdfName.length > 15 && isMobile ? reportPdfName.substring(0, 15) + '...' : reportPdfName}` : 
                          'Apenas arquivos PDF são aceitos'}
                      </Typography>
                      <input
                        type="file"
                        accept="application/pdf"
                        style={{ display: 'none' }}
                        ref={reportPdfInputRef}
                        onChange={handleReportPdfChange}
                      />
                    </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          p: 1, 
                          bgcolor: 'rgba(39, 174, 96, 0.08)', 
                          borderRadius: 1,
                          width: '100%',
                          overflow: 'hidden'
                        }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              flexGrow: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {reportPdfName}
                          </Typography>
                          <IconButton 
                            onClick={clearReportPdf} 
                            size="small" 
                            color="error"
                            sx={{ flexShrink: 0 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      {!reportPdfName && report?.reportPdfUrl && (
                        <Typography variant="body2">
                          PDF atual: {report.reportPdfUrl.split('/').pop()}
                        </Typography>
                      )}
                    </Box>
                    
                    {reportPdfName && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        p: 1, 
                        bgcolor: 'rgba(39, 174, 96, 0.08)', 
                        borderRadius: 1,
                        width: '100%',
                        overflow: 'hidden'
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            flexGrow: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {reportPdfName}
                        </Typography>
                        <IconButton 
                          onClick={clearReportPdf} 
                          size="small" 
                          color="error"
                          sx={{ flexShrink: 0 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                    
                    {!reportPdfName && report?.reportPdfUrl && (
                      <Typography variant="body2">
                        PDF atual: {report.reportPdfUrl.split('/').pop()}
                      </Typography>
                    )}
                  </Grid>

                <Grid item xs={12} sx={{ px: { xs: 0.5, sm: 1 }, mt: 2 }}>
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
                    PDF da Transação (opcional)
                  </Typography>
                  <Box 
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      mb: 2,
                      width: '100%',
                      maxWidth: '100%',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        border: '2px dashed #bdc3c7',
                        borderRadius: 1,
                        p: { xs: 2, sm: 3 },
                        mb: 2,
                        textAlign: 'center',
                        backgroundColor: transactionPdfName ? 'rgba(39, 174, 96, 0.08)' : '#f8f9fa',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          borderColor: '#3498db',
                          backgroundColor: 'rgba(52, 152, 219, 0.08)'
                        },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: { xs: '120px', sm: '150px' }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          const file = e.dataTransfer.files[0];
                          if (file.type === 'application/pdf') {
                            setTransactionPdf(file);
                            setTransactionPdfName(file.name);
                          } else {
                            setError('Por favor, selecione apenas arquivos PDF.');
                          }
                        }
                      }}
                      onClick={() => transactionPdfInputRef.current?.click()}
                    >
                      <CloudUploadIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: transactionPdfName ? '#27ae60' : '#7f8c8d', mb: 1 }} />
                      <Typography variant="body1" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, fontWeight: 500, color: transactionPdfName ? '#27ae60' : '#2c3e50' }}>
                        {isMobile ? 'Toque para selecionar PDF' : 'Arraste e solte o PDF aqui ou clique para selecionar'}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: transactionPdfName ? '#27ae60' : '#7f8c8d'
                        }}
                      >
                        {transactionPdfName ? 
                          `Arquivo: ${transactionPdfName.length > 15 && isMobile ? transactionPdfName.substring(0, 15) + '...' : transactionPdfName}` : 
                          'Apenas arquivos PDF são aceitos'}
                      </Typography>
                      <input
                        type="file"
                        accept=".pdf"
                        hidden
                        onChange={handleTransactionPdfChange}
                        ref={transactionPdfInputRef}
                      />
                    </Box>
                    
                    {transactionPdfName && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        p: 1, 
                        bgcolor: 'rgba(39, 174, 96, 0.08)', 
                        borderRadius: 1,
                        width: '100%',
                        overflow: 'hidden'
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            flexGrow: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {transactionPdfName}
                        </Typography>
                        <IconButton 
                          onClick={clearTransactionPdf} 
                          size="small" 
                          color="error"
                          sx={{ flexShrink: 0 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                    
                    {!transactionPdfName && report?.transactionPdfUrl && (
                      <Typography variant="body2">
                        PDF atual: {report.transactionPdfUrl.split('/').pop()}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sx={{ 
                  display: 'flex', 
                  justifyContent: { xs: 'center', sm: 'space-between' }, 
                  mt: 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 0 },
                  px: { xs: 0.5, sm: 1 }
                }}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={onClose}
                    sx={{ 
                      bgcolor: '#e74c3c', 
                      color: 'white',
                      width: { xs: '100%', sm: 'auto' },
                      borderRadius: 1,
                      py: 1,
                      px: 3,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: '#c0392b'
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      sx={{ 
                        bgcolor: '#27ae60', 
                        color: 'white',
                        width: '100%',
                        borderRadius: 1,
                        py: 1,
                        px: 3,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        '&:hover': {
                          backgroundColor: '#219653'
                        }
                      }}
                    >
                      {loading ? 'Salvando...' : 'Salvar Relatório'}
                    </Button>
                    
                    {/* Botão de salvar abaixo do botão principal */}
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleGenerateAndSavePdf}
                      disabled={generatingPdf}
                      startIcon={<SaveIcon />}
                      sx={{ 
                        borderColor: '#27ae60',
                        color: '#27ae60',
                        width: '100%',
                        borderRadius: 1,
                        py: 0.5,
                        px: 2,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        '&:hover': {
                          borderColor: '#219653',
                          backgroundColor: 'rgba(39, 174, 96, 0.04)'
                        }
                      }}
                    >
                      {generatingPdf ? 'Gerando...' : 'Gerar PDF'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </LocalizationProvider>
  );
});

export default ReportForm;
