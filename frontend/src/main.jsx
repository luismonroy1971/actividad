import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'
import './index.css'
import { store } from './store'
// Configurar axios
import axios from 'axios'

// Configurar la URL base para las peticiones API
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
axios.defaults.baseURL = apiUrl

// Configurar la URL base para las imágenes
window.UPLOADS_URL = apiUrl
// Aumentar el límite de listeners para evitar advertencias
import events from 'events';
if (events.EventEmitter && typeof events.EventEmitter.defaultMaxListeners !== 'undefined') {
  events.EventEmitter.defaultMaxListeners = 15;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)