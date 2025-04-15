import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateCliente, getClienteById } from '../../store/slices/clienteSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const Perfil = () => {
  const dispatch = useDispatch()
  const { userInfo } = useSelector((state) => state.auth)
  const { cliente, loading, error, success } = useSelector((state) => state.cliente)
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
    confirmPassword: ''
  })
  
  const [message, setMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  
  useEffect(() => {
    if (userInfo && userInfo.id) {
      dispatch(getClienteById(userInfo.id))
    }
  }, [dispatch, userInfo])
  
  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        password: '',
        confirmPassword: ''
      })
    }
  }, [cliente])
  
  useEffect(() => {
    if (success) {
      setSuccessMessage('Perfil actualizado correctamente')
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }, [success])
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage(null)
    
    // Validar contraseñas si se están actualizando
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage('Las contraseñas no coinciden')
      return
    }
    
    // Crear objeto con datos a actualizar
    const clienteData = {
      id: userInfo.id,
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      telefono: formData.telefono,
      direccion: formData.direccion
    }
    
    // Añadir contraseña solo si se está actualizando
    if (formData.password) {
      clienteData.password = formData.password
    }
    
    dispatch(updateCliente({id: userInfo.id, clienteData}))
      .unwrap()
      .then((updatedCliente) => {
        // La información de usuario se actualiza automáticamente en el estado
        
        // Limpiar campos de contraseña
        setFormData({
          ...formData,
          password: '',
          confirmPassword: ''
        })
      })
      .catch((err) => {
        console.error('Error al actualizar perfil:', err)
      })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Mi Perfil</h2>
        
        {loading && <Loader />}
        {error && <Message variant="error">{error}</Message>}
        {message && <Message variant="error">{message}</Message>}
        {successMessage && <Message variant="success">{successMessage}</Message>}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
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
            
            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
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
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
            
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cambiar Contraseña</h3>
            <p className="text-sm text-gray-500 mb-4">Deja estos campos en blanco si no deseas cambiar tu contraseña</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  minLength="6"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  minLength="6"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Perfil