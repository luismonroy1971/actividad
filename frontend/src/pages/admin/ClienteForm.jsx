import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { getClienteById, createCliente, updateCliente } from '../../store/slices/clienteSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const ClienteForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { cliente, loading, error, success } = useSelector((state) => state.clientes)
  
  const [formData, setFormData] = useState({
    nombre_completo: '',
    correo: '',
    documento_identidad: '',
    telefono: '',
    pregunta_validacion: '',
    respuesta_validacion: ''
  })
  
  const [submitted, setSubmitted] = useState(false)
  
  // Cargar datos del cliente si estamos en modo edición
  useEffect(() => {
    if (id) {
      dispatch(getClienteById(id))
    } else {
      // Limpiar el estado si estamos creando un nuevo cliente
      setFormData({
        nombre_completo: '',
        correo: '',
        documento_identidad: '',
        telefono: '',
        pregunta_validacion: '',
        respuesta_validacion: ''
      })
    }
  }, [dispatch, id])
  
  // Llenar el formulario con los datos del cliente cuando se carga
  useEffect(() => {
    if (id && cliente && cliente._id === id) {
      setFormData({
        nombre_completo: cliente.nombre_completo || '',
        correo: cliente.correo || '',
        documento_identidad: cliente.documento_identidad || '',
        telefono: cliente.telefono || '',
        pregunta_validacion: cliente.pregunta_validacion || '',
        respuesta_validacion: cliente.respuesta_validacion || ''
      })
    }
  }, [id, cliente])
  
  // Redireccionar después de guardar exitosamente
  useEffect(() => {
    if (submitted && success) {
      navigate('/admin/clientes')
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
    
    // Validar campos requeridos y eliminar espacios en blanco
    const trimmedData = {
      nombre_completo: formData.nombre_completo?.trim() || '',
      correo: formData.correo?.trim() || '',
      documento_identidad: formData.documento_identidad?.trim() || '',
      telefono: formData.telefono?.trim() || '',
      pregunta_validacion: formData.pregunta_validacion?.trim() || '',
      respuesta_validacion: formData.respuesta_validacion?.trim() || ''
    }
    
    // Verificar que no haya campos vacíos después del trim
    for (const [key, value] of Object.entries(trimmedData)) {
      if (!value) {
        return alert(`El campo ${key.replace('_', ' ')} no puede estar vacío`)
      }
    }
    
    // Validar formato de correo electrónico
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(trimmedData.correo)) {
      return alert('Por favor ingrese un correo electrónico válido')
    }
    
    if (id) {
      dispatch(updateCliente({ id, clienteData: trimmedData }))
    } else {
      dispatch(createCliente(trimmedData))
    }
    
    setSubmitted(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {id ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
        </h2>
        <button
          onClick={() => navigate('/admin/clientes')}
          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
        >
          ← Volver a clientes
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
              {/* Nombre Completo */}
              <div>
                <label htmlFor="nombre_completo" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nombre_completo"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              
              {/* Correo */}
              <div>
                <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              
              {/* Documento de Identidad */}
              <div>
                <label htmlFor="documento_identidad" className="block text-sm font-medium text-gray-700 mb-1">
                  Documento de Identidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="documento_identidad"
                  name="documento_identidad"
                  value={formData.documento_identidad}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              
              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
            
            {/* Pregunta de Validación */}
            <div>
              <label htmlFor="pregunta_validacion" className="block text-sm font-medium text-gray-700 mb-1">
                Pregunta de Validación <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="pregunta_validacion"
                name="pregunta_validacion"
                value={formData.pregunta_validacion}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
                placeholder="Ej: ¿Cuál es tu color favorito?"
              />
            </div>
            
            {/* Respuesta de Validación */}
            <div>
              <label htmlFor="respuesta_validacion" className="block text-sm font-medium text-gray-700 mb-1">
                Respuesta de Validación <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="respuesta_validacion"
                name="respuesta_validacion"
                value={formData.respuesta_validacion}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>
              {/* Botones de acción */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/admin/clientes')}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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

export default ClienteForm