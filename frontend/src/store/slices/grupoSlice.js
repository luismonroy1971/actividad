import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  grupos: [],
  grupo: null,
  loading: false,
  error: null,
  success: false,
}

// Obtener todos los grupos
export const getGrupos = createAsyncThunk(
  'grupos/getAll',
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

      let url = '/api/grupos'
      if (params.actividad) {
        url += `?actividad=${params.actividad}`
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

// Obtener un grupo por ID
export const getGrupoById = createAsyncThunk(
  'grupos/getById',
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

      const { data } = await axios.get(`/api/grupos/${id}`, config)
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

// Crear un grupo
export const createGrupo = createAsyncThunk(
  'grupos/create',
  async (grupoData, { rejectWithValue, getState }) => {
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

      const { data } = await axios.post('/api/grupos', grupoData, config)
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

// Actualizar un grupo
export const updateGrupo = createAsyncThunk(
  'grupos/update',
  async ({ id, grupoData }, { rejectWithValue, getState }) => {
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

      const { data } = await axios.put(`/api/grupos/${id}`, grupoData, config)
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

// Eliminar un grupo
export const deleteGrupo = createAsyncThunk(
  'grupos/delete',
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

      await axios.delete(`/api/grupos/${id}`, config)
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

// Agregar cliente a un grupo
export const agregarClienteAGrupo = createAsyncThunk(
  'grupos/agregarCliente',
  async ({ grupoId, clienteId }, { rejectWithValue, getState }) => {
    try {
      const {
        auth: { userInfo },
      } = getState()

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      const { data } = await axios.put(`/api/grupos/${grupoId}/clientes/${clienteId}`, {}, config)
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

// Quitar cliente de un grupo
export const quitarClienteDeGrupo = createAsyncThunk(
  'grupos/quitarCliente',
  async ({ grupoId, clienteId }, { rejectWithValue, getState }) => {
    try {
      const {
        auth: { userInfo },
      } = getState()

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      const { data } = await axios.delete(`/api/grupos/${grupoId}/clientes/${clienteId}`, config)
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

const grupoSlice = createSlice({
  name: 'grupos',
  initialState,
  reducers: {
    resetGrupoSuccess: (state) => {
      state.success = false
    },
  },
  extraReducers: (builder) => {
    builder
      // getGrupos
      .addCase(getGrupos.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getGrupos.fulfilled, (state, action) => {
        state.loading = false
        state.grupos = action.payload.data
        state.success = true
      })
      .addCase(getGrupos.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // getGrupoById
      .addCase(getGrupoById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getGrupoById.fulfilled, (state, action) => {
        state.loading = false
        state.grupo = action.payload.data
      })
      .addCase(getGrupoById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // createGrupo
      .addCase(createGrupo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createGrupo.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.grupos.push(action.payload.data)
      })
      .addCase(createGrupo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // updateGrupo
      .addCase(updateGrupo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateGrupo.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.grupo = action.payload.data
        state.grupos = state.grupos.map((grupo) =>
          grupo._id === action.payload.data._id ? action.payload.data : grupo
        )
      })
      .addCase(updateGrupo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // deleteGrupo
      .addCase(deleteGrupo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteGrupo.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.grupos = state.grupos.filter((grupo) => grupo._id !== action.payload)
      })
      .addCase(deleteGrupo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // agregarClienteAGrupo y quitarClienteDeGrupo
      .addCase(agregarClienteAGrupo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(agregarClienteAGrupo.fulfilled, (state) => {
        state.loading = false
        state.success = true
      })
      .addCase(agregarClienteAGrupo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(quitarClienteDeGrupo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(quitarClienteDeGrupo.fulfilled, (state) => {
        state.loading = false
        state.success = true
      })
      .addCase(quitarClienteDeGrupo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { resetGrupoSuccess } = grupoSlice.actions

export default grupoSlice.reducer