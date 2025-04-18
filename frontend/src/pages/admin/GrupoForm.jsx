import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { getGrupoById, createGrupo, updateGrupo } from '../../store/slices/grupoSlice'
import { fetchActividades } from '../../store/slices/actividadSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const GrupoForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { grupo, loading, error, success } = useSelector((state) => state.grupos)
  const { actividades, loading: actividadesLoading } = useSelector((state) => state.actividades)
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    actividad_id: ''
  })
  
  const [submitted, setSubmitted] = useState(false)
  
  // Cargar datos del grupo si estamos en modo edición
  useEffect(() => {
    dispatch(fetchActividades())
    
    if (id) {
      dispatch(getGrupoById(id))
    } else {
      // Limpiar el estado si estamos creando un nuevo grupo
      setFormData({
        nombre: '',
        descripcion: '',
        actividad_id: ''
      })
    }
  }, [dispatch, id])
  
  // Llenar el formulario con los datos del grupo cuando se carga
  useEffect(() => {
    if (id && grupo) {
      // Obtener los datos del grupo, ya sea de grupo directamente o de grupo.data
      const grupoData = grupo.data ? grupo.data : grupo;
      
      // Extraer el ID de actividad correctamente
      let actividadId = '';
      
      if (grupoData.actividad_id) {
        // Si es un objeto con _id (referencia poblada desde MongoDB)
        if (typeof grupoData.actividad_id === 'object' && grupoData.actividad_id._id) {
          actividadId = String(grupoData.actividad_id._id);
        }
        // Si es un string directo o un ObjectId
        else {
          actividadId = String(grupoData.actividad_id);
        }
      }
      
      // Actualizar el formulario con los datos del grupo
      setFormData({
        nombre: grupoData.nombre || '',
        descripcion: grupoData.descripcion || '',
        actividad_id: actividadId
      });
    }
  }, [id, grupo, actividades])
  
  // Redireccionar después de guardar exitosamente
  useEffect(() => {
    if (submitted && success) {
      navigate('/admin/grupos')
    }
  }, [success, submitted, navigate])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validar campos requeridos
    if (!formData.nombre || !formData.actividad_id) {
      return alert('Por favor completa todos los campos requeridos')
    }
    
    const grupoData = {
      ...formData
    }
    
    if (id) {
      dispatch(updateGrupo({ id, grupoData }))
    } else {
      dispatch(createGrupo(grupoData))
    }
    
    setSubmitted(true)
  }
  
  // Obtener la lista de actividades para el dropdown
  const getActividadesParaSelect = () => {
    if (!actividades) return [];
    
    // Determinar si las actividades están en actividades o actividades.data
    if (Array.isArray(actividades)) {
      return actividades;
    } else if (actividades.data && Array.isArray(actividades.data)) {
      return actividades.data;
    }
    
    return [];
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {id ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
        </h2>
        <button
          onClick={() => navigate('/admin/grupos')}
          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
        >
          ← Volver a grupos
        </button>
      </div>
      
      {loading || actividadesLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              
              {/* Actividad */}
              <div>
                <label htmlFor="actividad_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Actividad <span className="text-red-500">*</span>
                </label>
                <select
                  id="actividad_id"
                  name="actividad_id"
                  value={formData.actividad_id}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                >
                  <option value="">Seleccionar actividad</option>
                  {getActividadesParaSelect().map((actividad) => (
                    <option 
                      key={actividad._id} 
                      value={actividad._id}
                    >
                      {actividad.titulo}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Descripción */}
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin/grupos')}
                className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {id ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default GrupoForm