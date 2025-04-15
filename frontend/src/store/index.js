import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import actividadReducer from './slices/actividadSlice'
import clienteReducer from './slices/clienteSlice'
import pedidoReducer from './slices/pedidoSlice'
import opcionReducer from './slices/opcionSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    actividades: actividadReducer,
    clientes: clienteReducer,
    pedidos: pedidoReducer,
    opciones: opcionReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
})