import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  pedidos: [],
  pedido: null,
  loading: false,
  error: null,
  success: false,
  pagination: {},
  resumen: [],
}

// Obtener todos los pedidos
export const getPedidos = createAsyncThunk(
  'pedidos/getAll',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const {
        auth: { userInfo },
      } = getState()

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      let url = '/api/pedidos'
      if (params.page || params.limit) {
        url += `?page=${params.page || 1}&limit=${params.limit || 10}`
      }
      
      const { data } = await axios.get(url, config)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    }
  }
)

// Obtener un pedido por ID
export const getPedidoById = createAsyncThunk(
  'pedidos/getById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const {
        auth: { userInfo },
      } = getState()

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      const { data } = await axios.get(`/api/pedidos/${id}`, config)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    }
  }
)

// Crear un pedido
export const createPedido = createAsyncThunk(
  'pedidos/create',
  async (pedidoData, { rejectWithValue, getState }) => {
    try {
      const {
        auth: { userInfo },
      } = getState()

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      const { data } = await axios.post('/api/pedidos', pedidoData, config)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    }
  }
)

// Actualizar un pedido
export const updatePedido = createAsyncThunk(
  'pedidos/update',
  async ({ id, pedidoData }, { rejectWithValue, getState }) => {
    try {
      const {
        auth: { userInfo },
      } = getState()

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      const { data } = await axios.put(`/api/pedidos/${id}`, pedidoData, config)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    }
  }
)

// Eliminar un pedido
export const deletePedido = createAsyncThunk(
  'pedidos/delete',
  async (id, { rejectWithValue, getState }) => {
    try {
      const {
        auth: { userInfo },
      } = getState()

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      await axios.delete(`/api/pedidos/${id}`, config)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    }
  }
)

// Subir comprobante de pago
export const uploadComprobante = createAsyncThunk(
  'pedidos/uploadComprobante',
  async ({ id, formData }, { rejectWithValue, getState }) => {
    try {
      const {
        auth: { userInfo },
      } = getState()

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      const { data } = await axios.put(`/api/pedidos/${id}/comprobante`, formData, config)
      return { id, imagen: data.data }
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    }
  }
)

// Actualizar estado de un pedido
export const updatePedidoEstado = createAsyncThunk(
  'pedidos/updateEstado',
  async ({ id, estado }, { rejectWithValue, getState }) => {
    try {
      const {
        auth: { userInfo },
      } = getState()

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      const { data } = await axios.put(`/api/pedidos/${id}/estado`, { estado }, config)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    }
  }
)

// Obtener resumen de pedidos
export const getResumenPedidos = createAsyncThunk(
  'pedidos/getResumen',
  async (_, { rejectWithValue, getState }) => {
    try {
      const {
        auth: { userInfo },
      } = getState()

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      const { data } = await axios.get('/api/pedidos/resumen', config)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    }
  }
)

// Obtener pedidos del cliente actual
export const getClientePedidos = createAsyncThunk(
  'pedidos/getClientePedidos',
  async (_, { rejectWithValue, getState }) => {
    try {
      const {
        auth: { userInfo },
      } = getState()

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      const { data } = await axios.get('/api/pedidos/mispedidos', config)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    }
  }
)

const pedidoSlice = createSlice({
  name: 'pedidos',
  initialState,
  reducers: {
    clearPedidoError: (state) => {
      state.error = null
    },
    resetPedidoSuccess: (state) => {
      state.success = false
    },
    resetPedido: (state) => {
      state.pedido = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Pedidos
      .addCase(getPedidos.pending, (state) => {
        state.loading = true
      })
      .addCase(getPedidos.fulfilled, (state, action) => {
        state.loading = false
        state.pedidos = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(getPedidos.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Pedido By ID
      .addCase(getPedidoById.pending, (state) => {
        state.loading = true
      })
      .addCase(getPedidoById.fulfilled, (state, action) => {
        state.loading = false
        state.pedido = action.payload.data
      })
      .addCase(getPedidoById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Cliente Pedidos
      .addCase(getClientePedidos.pending, (state) => {
        state.loading = true
      })
      .addCase(getClientePedidos.fulfilled, (state, action) => {
        state.loading = false
        state.pedidos = action.payload.data
      })
      .addCase(getClientePedidos.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Pedido
      .addCase(createPedido.pending, (state) => {
        state.loading = true
      })
      .addCase(createPedido.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.pedido = action.payload.data
      })
      .addCase(createPedido.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Pedido
      .addCase(updatePedido.pending, (state) => {
        state.loading = true
      })
      .addCase(updatePedido.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.pedido = action.payload.data
        state.pedidos = state.pedidos.map((pedido) =>
          pedido._id === action.payload.data._id ? action.payload.data : pedido
        )
      })
      .addCase(updatePedido.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Pedido
      .addCase(deletePedido.pending, (state) => {
        state.loading = true
      })
      .addCase(deletePedido.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.pedidos = state.pedidos.filter(
          (pedido) => pedido._id !== action.payload
        )
      })
      .addCase(deletePedido.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Upload Comprobante
      .addCase(uploadComprobante.pending, (state) => {
        state.loading = true
      })
      .addCase(uploadComprobante.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        if (state.pedido && state.pedido._id === action.payload.id) {
          state.pedido.imagen_comprobante = action.payload.imagen
        }
        state.pedidos = state.pedidos.map((pedido) =>
          pedido._id === action.payload.id
            ? { ...pedido, imagen_comprobante: action.payload.imagen }
            : pedido
        )
      })
      .addCase(uploadComprobante.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Resumen
      .addCase(getResumenPedidos.pending, (state) => {
        state.loading = true
      })
      .addCase(getResumenPedidos.fulfilled, (state, action) => {
        state.loading = false
        state.resumen = action.payload.data
      })
      .addCase(getResumenPedidos.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Pedido Estado
      .addCase(updatePedidoEstado.pending, (state) => {
        state.loading = true
      })
      .addCase(updatePedidoEstado.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.pedido = action.payload.data
        state.pedidos = state.pedidos.map((pedido) =>
          pedido.id === action.payload.data.id ? action.payload.data : pedido
        )
      })
      .addCase(updatePedidoEstado.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearPedidoError, resetPedidoSuccess, resetPedido } = pedidoSlice.actions

export default pedidoSlice.reducer