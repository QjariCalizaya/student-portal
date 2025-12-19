import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "./styles/layout.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/header.css";
import "./styles/sidebar.css";
import "./styles/dashboard.css";
import "./styles/auth-buttons.css";



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
