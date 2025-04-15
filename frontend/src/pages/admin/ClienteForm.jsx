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
  
  const { cliente, loading, error, success } = useSelector((state) => state.cliente)
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    password: ''
  })
  
  const [submitted, setSubmitted] = useState(false)
  
  // Cargar datos del cliente si estamos en modo edición
  useEffect(() => {
    if (id) {
      dispatch(getClienteById(id))
    } else {
      // Limpiar el estado si estamos creando un nuevo cliente
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        password: ''
      })
    }
  }, [dispatch, id])
  
  // Llenar el formulario con los datos del cliente cuando se carga
  useEffect(() => {
    if (id && cliente && cliente.id === parseInt(id)) {
      setFormData({
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        password: '' // No mostrar la contraseña por seguridad
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
    
    // Validar campos requeridos
    if (!formData.nombre || !formData.apellido || !formData.email) {
      return alert('Por favor completa todos los campos requeridos')
    }
    
    const clienteData = {
      ...formData,
      rol: 'cliente' // Asegurarse de que se crea como cliente
    }
    
    // Si no hay contraseña y estamos editando, eliminarla del objeto
    if (id && !formData.password) {
      delete clienteData.password
    }
    
    if (id) {
      dispatch(updateCliente({ id, clienteData }))
    } else {
      dispatch(createCliente(clienteData))
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
              
              {/* Apellido */}
              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              
              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
            
            {/* Dirección */}
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            
            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {id ? 'Nueva Contraseña (dejar en blanco para mantener la actual)' : 'Contraseña'} {!id && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required={!id} // Solo requerido para nuevos clientes
                minLength="6"
              />
            </div>
            
            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/admin/clientes')}
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

export default ClienteForm