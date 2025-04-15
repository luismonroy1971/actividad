import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { getActividadById, createActividad, updateActividad } from '../../store/slices/actividadSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const ActividadForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { actividad, loading, error, success } = useSelector((state) => state.actividad)
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha: '',
    ubicacion: '',
    precio: '',
    requisitos: '',
    imagen: ''
  })
  
  const [submitted, setSubmitted] = useState(false)
  
  // Cargar datos de la actividad si estamos en modo edición
  useEffect(() => {
    if (id) {
      dispatch(getActividadById(id))
    } else {
      // Limpiar el estado si estamos creando una nueva actividad
      setFormData({
        nombre: '',
        descripcion: '',
        fecha: '',
        ubicacion: '',
        precio: '',
        requisitos: '',
        imagen: ''
      })
    }
  }, [dispatch, id])
  
  // Llenar el formulario con los datos de la actividad cuando se carga
  useEffect(() => {
    if (id && actividad && actividad.id === parseInt(id)) {
      setFormData({
        nombre: actividad.nombre || '',
        descripcion: actividad.descripcion || '',
        fecha: actividad.fecha ? new Date(actividad.fecha).toISOString().split('T')[0] : '',
        ubicacion: actividad.ubicacion || '',
        precio: actividad.precio || '',
        requisitos: actividad.requisitos || '',
        imagen: actividad.imagen || ''
      })
    }
  }, [id, actividad])
  
  // Redireccionar después de guardar exitosamente
  useEffect(() => {
    if (submitted && success) {
      navigate('/admin/actividades')
    }
  }, [success, submitted, navigate])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'precio' ? parseFloat(value) || '' : value
    })
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validar campos requeridos
    if (!formData.nombre || !formData.descripcion || !formData.fecha || !formData.precio) {
      return alert('Por favor completa todos los campos requeridos')
    }
    
    const actividadData = {
      ...formData,
      precio: parseFloat(formData.precio)
    }
    
    if (id) {
      dispatch(updateActividad({ id, actividadData }))
    } else {
      dispatch(createActividad(actividadData))
    }
    
    setSubmitted(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {id ? 'Editar Actividad' : 'Crear Nueva Actividad'}
        </h2>
        <button
          onClick={() => navigate('/admin/actividades')}
          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
        >
          ← Volver a actividades
        </button>
      </div>
      
      {loading ? (
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
              
              {/* Fecha */}
              <div>
                <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              
              {/* Ubicación */}
              <div>
                <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  id="ubicacion"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
            </div>
            
            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              ></textarea>
            </div>
            
            {/* Requisitos */}
            <div>
              <label htmlFor="requisitos" className="block text-sm font-medium text-gray-700 mb-1">
                Requisitos
              </label>
              <textarea
                id="requisitos"
                name="requisitos"
                value={formData.requisitos}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              ></textarea>
            </div>
            
            {/* URL de imagen */}
            <div>
              <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 mb-1">
                URL de imagen
              </label>
              <input
                type="url"
                id="imagen"
                name="imagen"
                value={formData.imagen}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {formData.imagen && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Vista previa:</p>
                  <img 
                    src={formData.imagen} 
                    alt="Vista previa" 
                    className="h-32 w-auto object-cover rounded-md border border-gray-300"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible'}
                  />
                </div>
              )}
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

export default ActividadForm