import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  actividades: [],
  actividad: null,
  loading: false,
  error: null,
  success: false,
  pagination: {},
}

// Función para obtener actividades (alias para getActividades)
export const fetchActividades = createAsyncThunk(
  'actividades/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      let url = '/api/actividades'
      if (params.page || params.limit) {
        url += `?page=${params.page || 1}&limit=${params.limit || 10}`
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

// Obtener todas las actividades
export const getActividades = createAsyncThunk(
  'actividades/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      let url = '/api/actividades'
      if (params.page || params.limit) {
        url += `?page=${params.page || 1}&limit=${params.limit || 10}`
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

// Obtener una actividad por ID
export const getActividadById = createAsyncThunk(
  'actividades/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/actividades/${id}`)
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

// Crear una actividad
export const createActividad = createAsyncThunk(
  'actividades/create',
  async (actividadData, { rejectWithValue, getState }) => {
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

      const { data } = await axios.post('/api/actividades', actividadData, config)
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

// Actualizar una actividad
export const updateActividad = createAsyncThunk(
  'actividades/update',
  async ({ id, actividadData }, { rejectWithValue, getState }) => {
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

      const { data } = await axios.put(`/api/actividades/${id}`, actividadData, config)
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

// Eliminar una actividad
export const deleteActividad = createAsyncThunk(
  'actividades/delete',
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

      await axios.delete(`/api/actividades/${id}`, config)
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

// Subir imagen para actividad
export const uploadActividadImage = createAsyncThunk(
  'actividades/uploadImage',
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

      const { data } = await axios.put(`/api/actividades/${id}/imagen`, formData, config)
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

const actividadSlice = createSlice({
  name: 'actividades',
  initialState,
  reducers: {
    clearActividadError: (state) => {
      state.error = null
    },
    resetActividadSuccess: (state) => {
      state.success = false
    },
    resetActividad: (state) => {
      state.actividad = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Actividades
      .addCase(getActividades.pending, (state) => {
        state.loading = true
      })
      .addCase(getActividades.fulfilled, (state, action) => {
        state.loading = false
        state.actividades = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(getActividades.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Actividad By ID
      .addCase(getActividadById.pending, (state) => {
        state.loading = true
      })
      .addCase(getActividadById.fulfilled, (state, action) => {
        state.loading = false
        state.actividad = action.payload.data
      })
      .addCase(getActividadById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Actividad
      .addCase(createActividad.pending, (state) => {
        state.loading = true
      })
      .addCase(createActividad.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.actividades.push(action.payload.data)
      })
      .addCase(createActividad.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Actividad
      .addCase(updateActividad.pending, (state) => {
        state.loading = true
      })
      .addCase(updateActividad.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.actividad = action.payload.data
        state.actividades = state.actividades.map((actividad) =>
          actividad._id === action.payload.data._id ? action.payload.data : actividad
        )
      })
      .addCase(updateActividad.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Actividad
      .addCase(deleteActividad.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteActividad.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.actividades = state.actividades.filter(
          (actividad) => actividad._id !== action.payload
        )
      })
      .addCase(deleteActividad.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Upload Image
      .addCase(uploadActividadImage.pending, (state) => {
        state.loading = true
      })
      .addCase(uploadActividadImage.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        if (state.actividad && state.actividad._id === action.payload.id) {
          state.actividad.imagen_promocional = action.payload.imagen
        }
        state.actividades = state.actividades.map((actividad) =>
          actividad._id === action.payload.id
            ? { ...actividad, imagen_promocional: action.payload.imagen }
            : actividad
        )
      })
      .addCase(uploadActividadImage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearActividadError, resetActividadSuccess, resetActividad } = actividadSlice.actions

export default actividadSlice.reducer