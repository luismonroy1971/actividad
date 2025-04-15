import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const UsuarioForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userInfo } = useSelector((state) => state.auth)
  
  const [loading, setLoading] = useState(false)
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [clientes, setClientes] = useState([])
  
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    password: '',
    rol: 'cliente',
    cliente_id: ''
  })
  
  // Cargar datos del usuario si estamos en modo edición
  useEffect(() => {
    if (id) {
      fetchUsuario()
    } else {
      // Limpiar el estado si estamos creando un nuevo usuario
      setFormData({
        nombre_usuario: '',
        password: '',
        rol: 'cliente',
        cliente_id: ''
      })
    }
    
    // Cargar lista de clientes para asociar
    fetchClientes()
  }, [id])
  
  // Redireccionar después de guardar exitosamente
  useEffect(() => {
    if (success) {
      navigate('/admin/usuarios')
    }
  }, [success, navigate])
  
  const fetchUsuario = async () => {
    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      
      const { data } = await axios.get(`/api/usuarios/${id}`, config)
      setFormData({
        nombre_usuario: data.nombre_usuario || '',
        password: '', // No mostrar la contraseña por seguridad
        rol: data.rol || 'cliente',
        cliente_id: data.cliente_id || ''
      })
      setLoading(false)
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
      setLoading(false)
    }
  }
  
  const fetchClientes = async () => {
    try {
      setLoadingClientes(true)
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      
      const { data } = await axios.get('/api/clientes', config)
      setClientes(data.data || [])
      setLoadingClientes(false)
    } catch (error) {
      console.error('Error al cargar clientes:', error)
      setLoadingClientes(false)
    }
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      
      const userData = { ...formData }
      
      // Si no hay contraseña y estamos editando, eliminarla del objeto
      if (id && !formData.password) {
        delete userData.password
      }
      
      // Si el rol no es cliente, eliminar la asociación con cliente
      if (userData.rol !== 'cliente') {
        userData.cliente_id = null
      }
      
      if (id) {
        await axios.put(`/api/usuarios/${id}`, userData, config)
      } else {
        await axios.post('/api/usuarios', userData, config)
      }
      
      setSuccess(true)
      setLoading(false)
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {id ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </h2>
        <button
          onClick={() => navigate('/admin/usuarios')}
          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
        >
          ← Volver a usuarios
        </button>
      </div>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nombre de usuario */}
            <div>
              <label htmlFor="nombre_usuario" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Usuario <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombre_usuario"
                name="nombre_usuario"
                value={formData.nombre_usuario}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
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
                required={!id} // Solo requerido para nuevos usuarios
                minLength="6"
              />
            </div>
            
            {/* Rol */}
            <div>
              <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              >
                <option value="cliente">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            
            {/* Cliente asociado (solo si el rol es cliente) */}
            {formData.rol === 'cliente' && (
              <div>
                <label htmlFor="cliente_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente Asociado {formData.rol === 'cliente' && <span className="text-red-500">*</span>}
                </label>
                {loadingClientes ? (
                  <Loader small />
                ) : (
                  <select
                    id="cliente_id"
                    name="cliente_id"
                    value={formData.cliente_id}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required={formData.rol === 'cliente'}
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map((cliente) => (
                      <option key={cliente._id} value={cliente._id}>
                        {cliente.nombre_completo} - {cliente.correo}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            
            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/admin/usuarios')}
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

export default UsuarioForm