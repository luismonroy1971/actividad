import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import actividadReducer from './slices/actividadSlice'
import clienteReducer from './slices/clienteSlice'
import pedidoReducer from './slices/pedidoSlice'
import opcionReducer from './slices/opcionSlice'
import grupoReducer from './slices/grupoSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    actividades: actividadReducer,
    clientes: clienteReducer,
    pedidos: pedidoReducer,
    opciones: opcionReducer,
    grupos: grupoReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
})