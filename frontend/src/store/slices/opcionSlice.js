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
export const fetchOpciones = createAsyncThunk(
  'opciones/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Construir URL con parámetros de consulta si se proporcionan
      let url = '/api/opciones';
      if (params.actividad_id) {
        url = `/api/opciones?actividad_id=${params.actividad_id}`;
      }
      
      const { data } = await axios.get(url);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    }
  }
)

// Alias para mantener compatibilidad
export const getOpciones = fetchOpciones

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
      // fetchOpciones
      .addCase(fetchOpciones.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchOpciones.fulfilled, (state, action) => {
        state.loading = false
        console.log('Respuesta API en fetchOpciones:', action.payload)
        
        // Extraer específicamente el array de 'data' de la respuesta
        if (action.payload && action.payload.data) {
          state.opciones = action.payload.data
        } else {
          // Fallback en caso de que la estructura sea diferente
          state.opciones = Array.isArray(action.payload) ? action.payload : []
        }
      })
      .addCase(fetchOpciones.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // getOpcionById
      .addCase(getOpcionById.pending, (state) => {
        state.loading = true
      })
      .addCase(getOpcionById.fulfilled, (state, action) => {
        state.loading = false
        console.log('Respuesta API en getOpcionById:', action.payload)
        
        // Extraer la opción de la respuesta
        if (action.payload && action.payload.data) {
          state.opcion = action.payload.data
        } else {
          state.opcion = action.payload
        }
      })
      .addCase(getOpcionById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // createOpcion
      .addCase(createOpcion.pending, (state) => {
        state.loading = true
      })
      .addCase(createOpcion.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        
        // Extraer la opción creada de la respuesta
        const nuevaOpcion = action.payload.data || action.payload
        
        // Añadir a la lista de opciones si el array existe
        if (Array.isArray(state.opciones)) {
          state.opciones.push(nuevaOpcion)
        } else {
          state.opciones = [nuevaOpcion]
        }
      })
      .addCase(createOpcion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // updateOpcion
      .addCase(updateOpcion.pending, (state) => {
        state.loading = true
      })
      .addCase(updateOpcion.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        
        // Extraer la opción actualizada de la respuesta
        const opcionActualizada = action.payload.data || action.payload
        
        state.opcion = opcionActualizada
        
        // Actualizar en el array de opciones si existe
        if (Array.isArray(state.opciones)) {
          state.opciones = state.opciones.map((opcion) =>
            opcion._id === opcionActualizada._id ? opcionActualizada : opcion
          )
        }
      })
      .addCase(updateOpcion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // deleteOpcion
      .addCase(deleteOpcion.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteOpcion.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        
        // Eliminar del array de opciones si existe
        if (Array.isArray(state.opciones)) {
          state.opciones = state.opciones.filter(
            (opcion) => opcion._id !== action.payload
          )
        }
      })
      .addCase(deleteOpcion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearOpcionError, resetOpcionSuccess, resetOpcion } = opcionSlice.actions

export default opcionSlice.reducer