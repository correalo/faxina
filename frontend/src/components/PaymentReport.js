import React from 'react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Close as CloseIcon, Print as PrintIcon, GetApp as DownloadIcon, WhatsApp as WhatsAppIcon } from '@mui/icons-material';
import { 
  Dialog, DialogTitle, DialogContent,
  Typography, Box, Paper, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableFooter,
  Toolbar, Stack
} from '@mui/material';

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
          alignItems: 'flex-start',
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
              maxWidth: { xs: '100%', sm: '100%', md: '210mm' }, // Responsivo em telas pequenas
              bgcolor: 'white',
              p: { xs: 1, sm: 2, md: 3 } // Padding responsivo
            }}
          >
            <Typography 
              variant="h5" 
              align="center" 
              gutterBottom
              sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.75rem' } }}
            >
              {title || 'Relatório de Pagamentos'}
            </Typography>
            
            <Typography 
              variant="body2" 
              gutterBottom
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              Total de pagamentos: {payments?.length || 0}
            </Typography>
            
            <Typography 
              variant="body2" 
              gutterBottom 
              mb={{ xs: 1, sm: 2, md: 3 }}
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              Valor total: {formatCurrency(totalValue || 0)}
            </Typography>
            
            <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: { xs: '100%', sm: '400px' } }}>
                <TableHead>
                  <TableRow style={{ backgroundColor: '#1a237e' }}>
                    <TableCell 
                      style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#1a237e' }}
                      sx={{ 
                        padding: { xs: '6px 8px', sm: '8px 16px' },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >Data</TableCell>
                    <TableCell 
                      style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#1a237e' }}
                      sx={{ 
                        padding: { xs: '6px 8px', sm: '8px 16px' },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >Valor</TableCell>
                    <TableCell 
                      style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#1a237e' }}
                      sx={{ 
                        padding: { xs: '6px 8px', sm: '8px 16px' },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >Data do Pagamento</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments && payments.map((payment, index) => (
                    <TableRow key={payment._id || index} sx={{ bgcolor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>
                      <TableCell sx={{ 
                        padding: { xs: '6px 8px', sm: '8px 16px' },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        {format(new Date(payment.data), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell sx={{ 
                        padding: { xs: '6px 8px', sm: '8px 16px' },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        {formatCurrency(payment.valor)}
                      </TableCell>
                      <TableCell sx={{ 
                        padding: { xs: '6px 8px', sm: '8px 16px' },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        {payment.dataPagamento ? format(new Date(payment.dataPagamento), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow style={{ backgroundColor: '#1a237e', fontWeight: 'bold' }}>
                    <TableCell 
                      style={{ fontWeight: 'bold', color: 'white', backgroundColor: '#1a237e' }}
                      sx={{ 
                        padding: { xs: '6px 8px', sm: '8px 16px' },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      TOTAL ({numeroFaxinas} faxinas)
                    </TableCell>
                    <TableCell 
                      style={{ fontWeight: 'bold', color: 'white', backgroundColor: '#1a237e' }}
                      sx={{ 
                        padding: { xs: '6px 8px', sm: '8px 16px' },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      {formatCurrency(totalValue || 0)}
                    </TableCell>
                    <TableCell 
                      style={{ color: 'white', backgroundColor: '#1a237e' }}
                      sx={{ 
                        padding: { xs: '6px 8px', sm: '8px 16px' },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentReport;
