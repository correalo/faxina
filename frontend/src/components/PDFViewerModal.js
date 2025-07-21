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
  Download as DownloadIcon
} from '@mui/icons-material';

const PDFViewerModal = ({ 
  open, 
  onClose, 
  pdfDoc, 
  filename = 'relatorio-faxina.pdf',
  onWhatsAppShare 
}) => {
  const [pdfDataUrl, setPdfDataUrl] = useState('');

  useEffect(() => {
    if (pdfDoc && open) {
      try {
        const pdfBlob = pdfDoc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        setPdfDataUrl(url);
        
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error('Error creating PDF URL:', error);
      }
    }
  }, [pdfDoc, open]);

  const handlePrint = () => {
    if (pdfDoc) {
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
    if (pdfDoc) {
      try {
        pdfDoc.save(filename);
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
