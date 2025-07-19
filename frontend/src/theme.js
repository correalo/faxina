import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#28a745', // Verde do botão "Novo Pagamento"
      light: '#34ce57',
      dark: '#218838',
      contrastText: '#fff',
    },
    secondary: {
      main: '#6c757d',
      light: '#848b92',
      dark: '#5a6268',
      contrastText: '#fff',
    },
    error: {
      main: '#dc3545', // Vermelho do botão "Excluir"
      light: '#e4606d',
      dark: '#bd2130',
      contrastText: '#fff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
    },
    divider: '#dee2e6',
  },
  typography: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
          borderRadius: '0.5rem',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.375rem',
          padding: '0.375rem 0.75rem',
          fontSize: '1rem',
          lineHeight: 1.5,
        },
        containedPrimary: {
          backgroundColor: '#28a745',
          '&:hover': {
            backgroundColor: '#218838',
          },
        },
        containedError: {
          backgroundColor: '#dc3545',
          '&:hover': {
            backgroundColor: '#c82333',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#343a40', // Cor do cabeçalho da tabela
          '& .MuiTableCell-head': {
            color: '#ffffff',
            fontWeight: 500,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '0.75rem',
          borderBottom: '1px solid #dee2e6',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#6c757d',
          '&.Mui-checked': {
            color: '#28a745',
          },
        },
      },
    },
  },
});

export default theme;
