import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AutoContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <ToastContainer 
        position="top-center" 
        autoClose={3000} 
        theme="colored"   // ✅ Enables green/red/orange/blue toast backgrounds
      />
    </AuthProvider>
  </StrictMode>
);
