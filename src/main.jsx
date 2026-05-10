import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './hooks/useApp';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Calculator } from './components/Calculator';
import './styles/globals.css';

function App() {
  return (
    <AppProvider>
      <Layout>
        <Dashboard />
      </Layout>
    </AppProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
