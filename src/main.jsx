// relief-hub/src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext'; // 추가

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AuthProvider> {/* AuthProvider로 감싸기 */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);