import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import PaymentList from './components/PaymentList';
import theme from './theme';
import './styles/global.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <PaymentList />
    </ThemeProvider>
  );
}

export default App;
