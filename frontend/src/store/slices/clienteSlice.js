import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  clientes: [],
  cliente: null,
  loading: false,
  error: null,
  success: false,
  pagination: {},
}

// Obtener todos los clientes
export const getClientes = createAsyncThunk(
  'clientes/getAll',
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

      let url = '/api/clientes'
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

// Obtener un cliente por ID
export const getClienteById = createAsyncThunk(
  'clientes/getById',
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

      const { data } = await axios.get(`/api/clientes/${id}`, config)
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

// Crear un cliente
export const createCliente = createAsyncThunk(
  'clientes/create',
  async (clienteData, { rejectWithValue, getState }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      }

      // Si hay un usuario autenticado, añadir el token
      const { auth: { userInfo } } = getState()
      if (userInfo) {
        config.headers.Authorization = `Bearer ${userInfo.token}`
      }

      const { data } = await axios.post('/api/clientes', clienteData, config)
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

// Actualizar un cliente
export const updateCliente = createAsyncThunk(
  'clientes/update',
  async ({ id, clienteData }, { rejectWithValue, getState }) => {
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

      const { data } = await axios.put(`/api/clientes/${id}`, clienteData, config)
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

// Eliminar un cliente
export const deleteCliente = createAsyncThunk(
  'clientes/delete',
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

      await axios.delete(`/api/clientes/${id}`, config)
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

const clienteSlice = createSlice({
  name: 'cliente',
  initialState,
  reducers: {
    clearClienteError: (state) => {
      state.error = null
    },
    resetClienteSuccess: (state) => {
      state.success = false
    },
    resetCliente: (state) => {
      state.cliente = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Clientes
      .addCase(getClientes.pending, (state) => {
        state.loading = true
      })
      .addCase(getClientes.fulfilled, (state, action) => {
        state.loading = false
        state.clientes = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(getClientes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Cliente By ID
      .addCase(getClienteById.pending, (state) => {
        state.loading = true
      })
      .addCase(getClienteById.fulfilled, (state, action) => {
        state.loading = false
        state.cliente = action.payload.data
      })
      .addCase(getClienteById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Cliente
      .addCase(createCliente.pending, (state) => {
        state.loading = true
      })
      .addCase(createCliente.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.cliente = action.payload.data
      })
      .addCase(createCliente.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Cliente
      .addCase(updateCliente.pending, (state) => {
        state.loading = true
      })
      .addCase(updateCliente.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.cliente = action.payload.data
        state.clientes = state.clientes.map((cliente) =>
          cliente._id === action.payload.data._id ? action.payload.data : cliente
        )
      })
      .addCase(updateCliente.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Cliente
      .addCase(deleteCliente.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteCliente.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.clientes = state.clientes.filter(
          (cliente) => cliente._id !== action.payload
        )
      })
      .addCase(deleteCliente.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearClienteError, resetClienteSuccess, resetCliente } = clienteSlice.actions

export default clienteSlice.reducer