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
  
  const { opcion, loading, error, success } = useSelector((state) => state.opcion)
  const { actividades, loading: actividadesLoading } = useSelector((state) => state.actividad)
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    actividad_id: '',
    disponible: true
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
        descripcion: '',
        precio: '',
        actividad_id: '',
        disponible: true
      })
    }
  }, [dispatch, id])
  
  // Llenar el formulario con los datos de la opción cuando se carga
  useEffect(() => {
    if (id && opcion && opcion.id === parseInt(id)) {
      setFormData({
        nombre: opcion.nombre || '',
        descripcion: opcion.descripcion || '',
        precio: opcion.precio || '',
        actividad_id: opcion.actividad_id || '',
        disponible: opcion.disponible !== undefined ? opcion.disponible : true
      })
    }
  }, [id, opcion])
  
  // Redireccionar después de guardar exitosamente
  useEffect(() => {
    if (submitted && success) {
      navigate('/admin/actividades')
    }
  }, [success, submitted, navigate])
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : 
              name === 'precio' ? parseFloat(value) || '' : 
              name === 'actividad_id' ? parseInt(value) || '' : value
    })
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validar campos requeridos
    if (!formData.nombre || !formData.precio || !formData.actividad_id) {
      return alert('Por favor completa todos los campos requeridos')
    }
    
    const opcionData = {
      ...formData,
      precio: parseFloat(formData.precio),
      actividad_id: parseInt(formData.actividad_id)
    }
    
    if (id) {
      dispatch(updateOpcion({ id, opcionData }))
    } else {
      dispatch(createOpcion(opcionData))
    }
    
    setSubmitted(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {id ? 'Editar Opción' : 'Crear Nueva Opción'}
        </h2>
        <button
          onClick={() => navigate('/admin/actividades')}
          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
        >
          ← Volver a actividades
        </button>
      </div>
      
      {loading || actividadesLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              
              {/* Precio */}
              <div>
                <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="precio"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    className="pl-7 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
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
                  {actividades && actividades.map((actividad) => (
                    <option key={actividad.id} value={actividad.id}>
                      {actividad.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Disponibilidad */}
              <div className="flex items-center h-full pt-6">
                <input
                  type="checkbox"
                  id="disponible"
                  name="disponible"
                  checked={formData.disponible}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="disponible" className="ml-2 block text-sm text-gray-900">
                  Disponible para reserva
                </label>
              </div>
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
            
            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/admin/actividades')}
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