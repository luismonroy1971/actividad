import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { getOpcionById, createOpcion, updateOpcion } from '../../store/slices/opcionSlice'
import { fetchActividades } from '../../store/slices/actividadSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const OpcionForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { opcion, loading, error, success } = useSelector((state) => state.opciones)
  const { actividades, loading: actividadesLoading } = useSelector((state) => state.actividades)
  
  const [formData, setFormData] = useState({
    nombre: '',
    actividad_id: ''
  })
  
  const [submitted, setSubmitted] = useState(false)
  
  // Cargar datos de la opción si estamos en modo edición
  useEffect(() => {
    dispatch(fetchActividades())
    
    if (id) {
      dispatch(getOpcionById(id))
    } else {
      // Limpiar el estado si estamos creando una nueva opción
      setFormData({
        nombre: '',
        actividad_id: ''
      })
    }
  }, [dispatch, id])
  
  // Llenar el formulario con los datos de la opción cuando se carga
  useEffect(() => {
    if (id && opcion) {
      console.log('Opción cargada para edición:', opcion);
      
      // Obtener los datos de la opción, ya sea de opcion directamente o de opcion.data
      const opcionData = opcion.data ? opcion.data : opcion;
      
      setFormData({
        nombre: opcionData.nombre || '',
        actividad_id: opcionData.actividad_id || ''
      })
      
      // Debugging para verificar el ID de actividad cargado
      console.log('ID de actividad cargado:', opcionData.actividad_id);
    }
  }, [id, opcion])
  
  // Redireccionar después de guardar exitosamente
  useEffect(() => {
    if (submitted && success) {
      navigate('/admin/opciones')
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
    
    const opcionData = {
      ...formData
    }
    
    console.log('Enviando datos:', opcionData);
    
    if (id) {
      dispatch(updateOpcion({ id, opcionData }))
    } else {
      dispatch(createOpcion(opcionData))
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
  
  // Debugging de estado actual
  useEffect(() => {
    console.log('Estado actual del formulario:', formData);
    console.log('Lista de actividades disponibles:', getActividadesParaSelect());
  }, [formData, actividades]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {id ? 'Editar Opción' : 'Crear Nueva Opción'}
        </h2>
        <button
          onClick={() => navigate('/admin/opciones')}
          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
        >
          ← Volver a opciones
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
                    <option key={actividad._id} value={actividad._id}>
                      {actividad.titulo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/admin/opciones')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={loading}
              >
                {loading ? 'Guardando...' : id ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default OpcionForm