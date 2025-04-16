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
      // fetchActividades
      .addCase(fetchActividades.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchActividades.fulfilled, (state, action) => {
        state.loading = false
        console.log('Respuesta API en fetchActividades:', action.payload)
        
        // Extraer específicamente el array de 'data' de la respuesta
        if (action.payload && action.payload.data) {
          state.actividades = action.payload.data
          state.pagination = action.payload.pagination || {}
        } else {
          // Fallback en caso de que la estructura sea diferente
          state.actividades = Array.isArray(action.payload) ? action.payload : []
        }
      })
      .addCase(fetchActividades.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // getActividades
      .addCase(getActividades.pending, (state) => {
        state.loading = true
      })
      .addCase(getActividades.fulfilled, (state, action) => {
        state.loading = false
        console.log('Respuesta API en getActividades:', action.payload)
        
        // Extraer específicamente el array de 'data' de la respuesta
        if (action.payload && action.payload.data) {
          state.actividades = action.payload.data
          state.pagination = action.payload.pagination || {}
        } else {
          // Fallback en caso de que la estructura sea diferente
          state.actividades = Array.isArray(action.payload) ? action.payload : []
        }
      })
      .addCase(getActividades.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // getActividadById
      .addCase(getActividadById.pending, (state) => {
        state.loading = true
      })
      .addCase(getActividadById.fulfilled, (state, action) => {
        state.loading = false
        console.log('Respuesta API en getActividadById:', action.payload)
        
        // Extraer la actividad de la respuesta
        if (action.payload && action.payload.data) {
          state.actividad = action.payload.data
        } else {
          state.actividad = action.payload
        }
      })
      .addCase(getActividadById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // createActividad
      .addCase(createActividad.pending, (state) => {
        state.loading = true
      })
      .addCase(createActividad.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        
        // Extraer la actividad creada de la respuesta
        const nuevaActividad = action.payload.data || action.payload
        
        state.actividades.push(nuevaActividad)
      })
      .addCase(createActividad.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // updateActividad
      .addCase(updateActividad.pending, (state) => {
        state.loading = true
      })
      .addCase(updateActividad.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        
        // Extraer la actividad actualizada de la respuesta
        const actividadActualizada = action.payload.data || action.payload
        
        state.actividad = actividadActualizada
        state.actividades = state.actividades.map((actividad) =>
          actividad._id === actividadActualizada._id ? actividadActualizada : actividad
        )
      })
      .addCase(updateActividad.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // deleteActividad
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
      
      // uploadActividadImage
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