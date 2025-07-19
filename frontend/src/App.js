import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Button, Box, Container } from '@mui/material';
import PaymentList from './components/PaymentList';
import PaymentForm from './components/PaymentForm';
import theme from './theme';
import './styles/global.css';

function App() {
  const [activeView, setActiveView] = useState('list');
  const [refreshList, setRefreshList] = useState(0);

  const handlePaymentCreated = () => {
    setRefreshList(prev => prev + 1);
    setActiveView('list');
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          p: 3,
        }}>
          <Button
            variant={activeView === 'list' ? 'contained' : 'outlined'}
            onClick={() => setActiveView('list')}
            color="primary"
          >
            Lista de Pagamentos
          </Button>
          <Button
            variant={activeView === 'form' ? 'contained' : 'outlined'}
            onClick={() => setActiveView('form')}
            color="primary"
          >
            Novo Pagamento
          </Button>
        </Box>

        {activeView === 'list' ? (
          <PaymentList key={refreshList} />
        ) : (
          <PaymentForm onPaymentCreated={handlePaymentCreated} />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
