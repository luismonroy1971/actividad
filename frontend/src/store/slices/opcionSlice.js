import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  opciones: [],
  opcion: null,
  loading: false,
  error: null,
  success: false,
}

// Obtener todas las opciones
export const getOpciones = createAsyncThunk(
  'opciones/getAll',
  async (actividadId = null, { rejectWithValue }) => {
    try {
      let url = '/api/opciones'
      if (actividadId) {
        url += `?actividad_id=${actividadId}`
      }
      
      const { data } = await axios.get(url)
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

// Obtener opciones por actividad
export const getOpcionesPorActividad = createAsyncThunk(
  'opciones/getByActividad',
  async (actividadId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/actividades/${actividadId}/opciones`)
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

// Obtener una opción por ID
export const getOpcionById = createAsyncThunk(
  'opciones/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/opciones/${id}`)
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

// Crear una opción
export const createOpcion = createAsyncThunk(
  'opciones/create',
  async (opcionData, { rejectWithValue, getState }) => {
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

      const { data } = await axios.post('/api/opciones', opcionData, config)
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

// Actualizar una opción
export const updateOpcion = createAsyncThunk(
  'opciones/update',
  async ({ id, opcionData }, { rejectWithValue, getState }) => {
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

      const { data } = await axios.put(`/api/opciones/${id}`, opcionData, config)
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

// Eliminar una opción
export const deleteOpcion = createAsyncThunk(
  'opciones/delete',
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

      await axios.delete(`/api/opciones/${id}`, config)
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

const opcionSlice = createSlice({
  name: 'opciones',
  initialState,
  reducers: {
    clearOpcionError: (state) => {
      state.error = null
    },
    resetOpcionSuccess: (state) => {
      state.success = false
    },
    resetOpcion: (state) => {
      state.opcion = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Opciones
      .addCase(getOpciones.pending, (state) => {
        state.loading = true
      })
      .addCase(getOpciones.fulfilled, (state, action) => {
        state.loading = false
        state.opciones = action.payload.data
      })
      .addCase(getOpciones.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Opciones Por Actividad
      .addCase(getOpcionesPorActividad.pending, (state) => {
        state.loading = true
      })
      .addCase(getOpcionesPorActividad.fulfilled, (state, action) => {
        state.loading = false
        state.opciones = action.payload.data
      })
      .addCase(getOpcionesPorActividad.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Opcion By ID
      .addCase(getOpcionById.pending, (state) => {
        state.loading = true
      })
      .addCase(getOpcionById.fulfilled, (state, action) => {
        state.loading = false
        state.opcion = action.payload.data
      })
      .addCase(getOpcionById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Opcion
      .addCase(createOpcion.pending, (state) => {
        state.loading = true
      })
      .addCase(createOpcion.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.opciones.push(action.payload.data)
      })
      .addCase(createOpcion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Opcion
      .addCase(updateOpcion.pending, (state) => {
        state.loading = true
      })
      .addCase(updateOpcion.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.opcion = action.payload.data
        state.opciones = state.opciones.map((opcion) =>
          opcion._id === action.payload.data._id ? action.payload.data : opcion
        )
      })
      .addCase(updateOpcion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Opcion
      .addCase(deleteOpcion.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteOpcion.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.opciones = state.opciones.filter(
          (opcion) => opcion._id !== action.payload
        )
      })
      .addCase(deleteOpcion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearOpcionError, resetOpcionSuccess, resetOpcion } = opcionSlice.actions

export default opcionSlice.reducer