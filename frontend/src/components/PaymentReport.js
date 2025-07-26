import React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { Typography, Box, Paper, Toolbar, Stack, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/GetApp';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Estilos CSS para controlar o que aparece na impressão
const printStyles = `
  @media print {
    /* Oculta TUDO exceto o conteúdo do relatório */
    body > *:not(.MuiDialog-root),
    .MuiDialog-root > *:not(.MuiDialog-container),
    .MuiDialog-container > *:not(.MuiDialog-paper),
    .MuiBackdrop-root,
    .no-print, 
    .MuiToolbar-root, 
    .MuiDialogTitle-root, 
    .MuiIconButton-root {
      display: none !important;
    }
    
    /* Remove margens, backgrounds e padding desnecessários */
    .MuiDialog-root,
    .MuiDialog-container,
    .MuiDialog-paper,
    .MuiDialogContent-root {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      background-color: white !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0 !important;
      transform: none !important;
    }
    
    /* Garante que o conteúdo seja impresso em página inteira */
    body {
      background-color: white !important;
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Remove qualquer fundo escurecido ou overlay */
    .MuiBackdrop-root,
    .MuiDialog-root::before,
    .MuiDialog-container::before {
      opacity: 0 !important;
      background: none !important;
    }
  }
`;

const PaymentReport = ({ open, onClose, payments, totalValue, title }) => {
  // Calculando o número de faxinas (assumindo que cada pagamento representa uma faxina)
  const numeroFaxinas = payments ? payments.length : 0;
  
  // Adiciona os estilos de impressão ao documento
  React.useEffect(() => {
    // Cria um elemento style
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'print-styles';
    style.appendChild(document.createTextNode(printStyles));
    
    // Adiciona ao head do documento
    document.head.appendChild(style);
    
    // Cleanup: remove o estilo quando o componente for desmontado
    return () => {
      const styleElement = document.getElementById('print-styles');
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para imprimir o relatório
  const handlePrint = () => {
    window.print();
  };
  
  // Função para compartilhar via WhatsApp
  const handleWhatsApp = () => {
    const message = `*${title || 'Relatório de Pagamentos'}*\n\n` +
      `Total de pagamentos: ${numeroFaxinas} faxinas\n` +
      `Valor total: ${formatCurrency(totalValue || 0)}\n\n` +
      `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };
  
  // Função para gerar e baixar o PDF usando html2canvas + jsPDF
  const handleDownload = async () => {
    try {
      const element = document.getElementById('payment-report-content');

      if (!element) {
        alert("Elemento não encontrado.");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Gerar o PDF como Blob e forçar o download
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Adiciona timestamp ao nome do arquivo
      const now = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const filename = `relatorio-pagamentos-${now}.pdf`;
      
      link.download = filename; // GARANTE a extensão .pdf com timestamp
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
          bgcolor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title || 'Relatório de Pagamentos'}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Toolbar 
        variant="dense" 
        sx={{ 
          bgcolor: '#e0e0e0', 
          borderBottom: '1px solid #ccc',
          borderTop: '1px solid #ccc',
          minHeight: '48px',
          px: 2
        }}
      >
        <Stack direction="row" spacing={1}>
          <Tooltip title="Imprimir">
            <IconButton onClick={handlePrint} size="small">
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Baixar PDF">
            <IconButton onClick={handleDownload} size="small">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Compartilhar via WhatsApp">
            <IconButton onClick={handleWhatsApp} size="small" sx={{ color: '#25D366' }}>
              <WhatsAppIcon />
            </IconButton>
          </Tooltip>

        </Stack>
      </Toolbar>
      
      <DialogContent sx={{ p: 0, flexGrow: 1, overflow: 'hidden' }}>
        <Box sx={{ 
          height: '100%', 
          width: '100%', 
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center', // Centraliza verticalmente também
          p: { xs: 1, sm: 2 }, // Padding menor em telas pequenas
          bgcolor: '#f5f5f5'
        }}>
          <Paper 
            id="payment-report-content"
            elevation={3} 
            sx={{ 
              overflow: 'hidden',
              width: '100%',
              height: 'auto',
              maxWidth: { xs: '98%', sm: '90%', md: '210mm' }, // Mais centralizado em telas pequenas
              mx: 'auto', // Centraliza horizontalmente
              bgcolor: 'white',
              p: { xs: 0.5, sm: 2, md: 3 } // Padding menor em telas pequenas
            }}
          >
            <Typography 
              variant="h5" 
              align="center" 
              gutterBottom
              sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem', md: '1.75rem' }, fontWeight: 'bold' }}
            >
              {title || 'Relatório de Pagamentos'}
            </Typography>
            
            <Typography 
              variant="body2" 
              align="center"
              gutterBottom
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Total de pagamentos: {payments?.length || 0}
            </Typography>
            
            <Typography 
              variant="body2" 
              align="center"
              gutterBottom 
              mb={{ xs: 1, sm: 2, md: 3 }}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 'bold' }}
            >
              Valor total: {formatCurrency(totalValue || 0)}
            </Typography>
            
            <Box sx={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                width: { xs: '90%', sm: '80%', md: '70%' },
                maxWidth: '400px',
                border: '1px solid rgba(224, 224, 224, 1)',
                mx: 'auto',
                borderRadius: 1,
                overflow: 'hidden'
              }}>
                {/* Header */}
                <Box sx={{ 
                  backgroundColor: '#1a237e', 
                  color: 'white', 
                  fontWeight: 'bold',
                  padding: { xs: '4px 4px', sm: '8px 16px' },
                  fontSize: { xs: '0.65rem', sm: '0.875rem' },
                  whiteSpace: 'nowrap',
                  borderRight: '1px solid rgba(224, 224, 224, 0.4)'
                }}>
                  DATA
                </Box>
                <Box sx={{ 
                  backgroundColor: '#1a237e', 
                  color: 'white', 
                  fontWeight: 'bold',
                  padding: { xs: '4px 4px', sm: '8px 16px' },
                  fontSize: { xs: '0.65rem', sm: '0.875rem' },
                  whiteSpace: 'nowrap',
                  borderRight: '1px solid rgba(224, 224, 224, 0.4)'
                }}>
                  VALOR
                </Box>
                <Box sx={{ 
                  backgroundColor: '#1a237e', 
                  color: 'white', 
                  fontWeight: 'bold',
                  padding: { xs: '4px 4px', sm: '8px 16px' },
                  fontSize: { xs: '0.65rem', sm: '0.875rem' },
                  whiteSpace: 'nowrap'
                }}>
                  DATA PGTO
                </Box>
                
                {/* Rows */}
                {payments && payments.map((payment, index) => (
                  <React.Fragment key={payment._id || index}>
                    <Box sx={{ 
                      padding: { xs: '4px 4px', sm: '8px 16px' },
                      fontSize: { xs: '0.65rem', sm: '0.875rem' },
                      whiteSpace: 'nowrap',
                      backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white',
                      borderRight: '1px solid rgba(224, 224, 224, 1)',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)'
                    }}>
                      {format(new Date(payment.data), 'dd/MM/yyyy')}
                    </Box>
                    <Box sx={{ 
                      padding: { xs: '4px 4px', sm: '8px 16px' },
                      fontSize: { xs: '0.65rem', sm: '0.875rem' },
                      whiteSpace: 'nowrap',
                      backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white',
                      borderRight: '1px solid rgba(224, 224, 224, 1)',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)'
                    }}>
                      {formatCurrency(payment.valor)}
                    </Box>
                    <Box sx={{ 
                      padding: { xs: '4px 4px', sm: '8px 16px' },
                      fontSize: { xs: '0.65rem', sm: '0.875rem' },
                      whiteSpace: 'nowrap',
                      backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)'
                    }}>
                      {payment.dataPagamento ? format(new Date(payment.dataPagamento), 'dd/MM/yyyy') : '-'}
                    </Box>
                  </React.Fragment>
                ))}
                
                {/* Footer */}
                <Box sx={{ 
                  backgroundColor: '#1a237e', 
                  color: 'white', 
                  fontWeight: 'bold',
                  padding: { xs: '4px 4px', sm: '8px 16px' },
                  fontSize: { xs: '0.65rem', sm: '0.875rem' },
                  whiteSpace: 'nowrap',
                  borderRight: '1px solid rgba(224, 224, 224, 0.4)'
                }}>
                  TOTAL ({numeroFaxinas})
                </Box>
                <Box sx={{ 
                  backgroundColor: '#1a237e', 
                  color: 'white', 
                  fontWeight: 'bold',
                  padding: { xs: '4px 4px', sm: '8px 16px' },
                  fontSize: { xs: '0.65rem', sm: '0.875rem' },
                  whiteSpace: 'nowrap',
                  gridColumn: '2 / 4'
                }}>
                  {formatCurrency(totalValue || 0)}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentReport;
