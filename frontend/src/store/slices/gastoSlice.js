import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  gastos: [],
  gasto: null,
  resumenFinanciero: null,
  loading: false,
  error: null,
  success: false,
}

// Obtener gastos por actividad
export const getGastosPorActividad = createAsyncThunk(
  'gastos/getByActividad',
  async (actividadId, { rejectWithValue, getState }) => {
    try {
      const {
        auth: { userInfo },
      } = getState()

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      const { data } = await axios.get(`/api/gastos/actividad/${actividadId}`, config)
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

// Obtener resumen financiero por actividad
export const getResumenFinanciero = createAsyncThunk(
  'gastos/getResumen',
  async (actividadId, { rejectWithValue, getState }) => {
    try {
      const {
        auth: { userInfo },
      } = getState()

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      const { data } = await axios.get(`/api/gastos/resumen/${actividadId}`, config)
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

// Crear un nuevo gasto
export const createGasto = createAsyncThunk(
  'gastos/create',
  async (gastoData, { rejectWithValue, getState }) => {
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

      const { data } = await axios.post('/api/gastos', gastoData, config)
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

// Actualizar un gasto
export const updateGasto = createAsyncThunk(
  'gastos/update',
  async ({ id, gastoData }, { rejectWithValue, getState }) => {
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

      const { data } = await axios.put(`/api/gastos/${id}`, gastoData, config)
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

// Eliminar un gasto
export const deleteGasto = createAsyncThunk(
  'gastos/delete',
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

      await axios.delete(`/api/gastos/${id}`, config)
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

const gastoSlice = createSlice({
  name: 'gastos',
  initialState,
  reducers: {
    resetGastoState: (state) => {
      state.success = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Obtener gastos por actividad
      .addCase(getGastosPorActividad.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getGastosPorActividad.fulfilled, (state, action) => {
        state.loading = false
        state.gastos = action.payload.data
        state.success = true
      })
      .addCase(getGastosPorActividad.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Obtener resumen financiero
      .addCase(getResumenFinanciero.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getResumenFinanciero.fulfilled, (state, action) => {
        state.loading = false
        state.resumenFinanciero = action.payload
        state.success = true
      })
      .addCase(getResumenFinanciero.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Crear gasto
      .addCase(createGasto.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createGasto.fulfilled, (state, action) => {
        state.loading = false
        state.gastos.push(action.payload.data)
        state.success = true
      })
      .addCase(createGasto.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Actualizar gasto
      .addCase(updateGasto.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateGasto.fulfilled, (state, action) => {
        state.loading = false
        state.gastos = state.gastos.map((gasto) =>
          gasto._id === action.payload.data._id ? action.payload.data : gasto
        )
        state.success = true
      })
      .addCase(updateGasto.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Eliminar gasto
      .addCase(deleteGasto.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteGasto.fulfilled, (state, action) => {
        state.loading = false
        state.gastos = state.gastos.filter((gasto) => gasto._id !== action.payload)
        state.success = true
      })
      .addCase(deleteGasto.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { resetGastoState } = gastoSlice.actions
export default gastoSlice.reducer