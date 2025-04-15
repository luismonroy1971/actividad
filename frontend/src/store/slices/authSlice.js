import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Obtener usuario del localStorage
const userInfo = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null

const initialState = {
  userInfo,
  loading: false,
  error: null,
}

// Login de usuario
export const login = createAsyncThunk(
  'auth/login',
  async ({ identificacion, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      }

      const { data } = await axios.post(
        '/api/usuarios/login',
        { identificacion, password },
        config
      )

      localStorage.setItem('userInfo', JSON.stringify(data))

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

// Login de cliente con teléfono
export const loginCliente = createAsyncThunk(
  'auth/loginCliente',
  async ({ telefono }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      }

      const { data } = await axios.post(
        '/api/usuarios/login-cliente',
        { telefono },
        config
      )

      localStorage.setItem('userInfo', JSON.stringify(data))

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

// Registro de usuario
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      }

      const { data } = await axios.post('/api/usuarios', userData, config)

      localStorage.setItem('userInfo', JSON.stringify(data))

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

// Logout de usuario
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('userInfo')
  return null
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.userInfo = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Login Cliente
      .addCase(loginCliente.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginCliente.fulfilled, (state, action) => {
        state.loading = false
        state.userInfo = action.payload
      })
      .addCase(loginCliente.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.userInfo = action.payload
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.userInfo = null
      })
  },
})

export const { clearError } = authSlice.actions

export default authSlice.reducer