import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import {
  Close as CloseIcon,
  Print as PrintIcon,
  WhatsApp as WhatsAppIcon,
  Download as DownloadIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const PDFViewerModal = ({ 
  open, 
  onClose, 
  pdfUrl, 
  pdfDoc,
  filename = 'relatorio-faxina.pdf',
  onWhatsAppShare,
  onSavePdf
}) => {
  const [pdfDataUrl, setPdfDataUrl] = useState('');

  useEffect(() => {
    if (open) {
      if (pdfDoc) {
        // Se tiver um objeto PDF, converter para URL de dados
        try {
          const dataUrl = pdfDoc.output('dataurlstring');
          setPdfDataUrl(dataUrl);
        } catch (error) {
          console.error('Erro ao converter PDF para URL de dados:', error);
          setPdfDataUrl('');
        }
      } else if (pdfUrl) {
        // Se tiver uma URL de PDF, usar diretamente
        setPdfDataUrl(pdfUrl);
      } else {
        setPdfDataUrl('');
      }
    } else {
      setPdfDataUrl('');
    }
  }, [pdfDoc, pdfUrl, open]);

  const handlePrint = () => {
    if (pdfDataUrl) {
      try {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Imprimir - ${filename}</title>
                <style>
                  body { margin: 0; padding: 0; }
                  iframe { width: 100%; height: 100vh; border: none; }
                </style>
              </head>
              <body>
                <iframe src="${pdfDataUrl}"></iframe>
              </body>
            </html>
          `);
          printWindow.document.close();
          setTimeout(() => printWindow.print(), 1000);
        }
      } catch (error) {
        console.error('Error printing PDF:', error);
      }
    }
  };

  const handleDownload = () => {
    if (pdfDataUrl) {
      try {
        // Criar um link para download da URL
        const link = document.createElement('a');
        link.href = pdfDataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading PDF:', error);
      }
    }
  };

  const handleClose = () => {
    setPdfDataUrl('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            Visualizar Relatório PDF
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={handlePrint}>
              <PrintIcon />
            </IconButton>
            
            <IconButton size="small" onClick={onWhatsAppShare} color="success">
              <WhatsAppIcon />
            </IconButton>
            
            <IconButton size="small" onClick={handleDownload}>
              <DownloadIcon />
            </IconButton>
            
            <IconButton size="small" onClick={onSavePdf} color="primary">
              <SaveIcon />
            </IconButton>
            
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'auto', backgroundColor: '#e0e0e0' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            minHeight: '100%',
            p: 2
          }}
        >
          {pdfDataUrl && (
            <Box
              sx={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                borderRadius: 1,
                overflow: 'hidden',
                backgroundColor: 'white'
              }}
            >
              <iframe
                src={pdfDataUrl}
                width="794"
                height="1123"
                style={{
                  border: 'none',
                  display: 'block'
                }}
                title="PDF Preview"
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1, backgroundColor: '#f5f5f5', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          {filename}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<WhatsAppIcon />}
            onClick={onWhatsAppShare}
            size="small"
          >
            WhatsApp
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={onSavePdf}
            size="small"
          >
            Salvar esse relatório
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            size="small"
          >
            Imprimir
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            size="small"
          >
            Baixar
          </Button>
          
          <Button onClick={handleClose} size="small">
            Fechar
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default PDFViewerModal;
