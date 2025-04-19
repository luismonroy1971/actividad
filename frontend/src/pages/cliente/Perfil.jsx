import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateCliente, getClienteById } from '../../store/slices/clienteSlice'
import { updateUserInfo, updateUserPassword } from '../../store/slices/authSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const Perfil = () => {
  const dispatch = useDispatch()
  const { userInfo } = useSelector((state) => state.auth)
  const { cliente = null, loading = false, error = null, success = false } = useSelector((state) => state.clientes || {})
  
  const [formData, setFormData] = useState({
    nombre_completo: '',
    correo: '',
    documento_identidad: '',
    telefono: '',
    pregunta_validacion: '',
    respuesta_validacion: '',
    grupo_id: '',
    password: '',
    confirmPassword: ''
  })
  
  const [message, setMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  
  useEffect(() => {
    if (userInfo && userInfo.cliente_id) {
      dispatch(getClienteById(userInfo.cliente_id))
    }
  }, [dispatch, userInfo])
  
  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre_completo: cliente.nombre_completo || '',
        correo: cliente.correo || '',
        documento_identidad: cliente.documento_identidad || '',
        telefono: cliente.telefono || '',
        pregunta_validacion: cliente.pregunta_validacion || '',
        respuesta_validacion: cliente.respuesta_validacion || '',
        grupo_id: cliente.grupo_id || '',
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
      nombre_completo: formData.nombre_completo,
      correo: formData.correo,
      documento_identidad: formData.documento_identidad,
      telefono: formData.telefono,
      pregunta_validacion: formData.pregunta_validacion,
      respuesta_validacion: formData.respuesta_validacion
    }
    
    // Mantener el grupo_id existente si está presente
    // Esto asegura que se respete el grupo_id previamente asignado
    if (formData.grupo_id) {
      clienteData.grupo_id = formData.grupo_id
    }
    
    // Añadir contraseña solo si se está actualizando
    if (formData.password) {
      clienteData.password = formData.password
    }
    
    dispatch(updateCliente({id: userInfo.cliente_id, clienteData}))
      .unwrap()
      .then((updatedCliente) => {
        // Actualizar la información del usuario en el estado global
        // Esto asegura que los cambios en el cliente se reflejen en el usuario relacionado
        const updatedUserInfo = {
          ...userInfo,
          nombre: updatedCliente.nombre_completo,
          correo: updatedCliente.correo,
          telefono: updatedCliente.telefono,
          documento_identidad: updatedCliente.documento_identidad
        }
        
        // Actualizar el estado global del usuario
        dispatch(updateUserInfo(updatedUserInfo))
        
        // Si se actualizó la contraseña, también actualizar en el usuario relacionado
        if (formData.password) {
          // Llamar a la acción para actualizar la contraseña del usuario relacionado
          dispatch(updateUserPassword({
            userId: userInfo._id,
            password: formData.password
          }))
        }
        
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
              <label htmlFor="nombre_completo" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
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
            
            <div>
              <label htmlFor="documento_identidad" className="block text-sm font-medium text-gray-700 mb-1">Documento de Identidad</label>
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
            
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
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
            
            <div>
              <label htmlFor="pregunta_validacion" className="block text-sm font-medium text-gray-700 mb-1">Pregunta de Validación</label>
              <input
                type="text"
                id="pregunta_validacion"
                name="pregunta_validacion"
                value={formData.pregunta_validacion}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="respuesta_validacion" className="block text-sm font-medium text-gray-700 mb-1">Respuesta de Validación</label>
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