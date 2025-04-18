import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import actividadReducer from './slices/actividadSlice'
import clienteReducer from './slices/clienteSlice'
import pedidoReducer from './slices/pedidoSlice'
import opcionReducer from './slices/opcionSlice'
import grupoReducer from './slices/grupoSlice'
import gastoReducer from './slices/gastoSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    actividades: actividadReducer,
    clientes: clienteReducer,
    pedidos: pedidoReducer,
    opciones: opcionReducer,
    grupos: grupoReducer,
    gastos: gastoReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
})