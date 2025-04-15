import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register } from '../../store/slices/authSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import axios from 'axios'

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    documento_identidad: '',
    pregunta_validacion: '',
    respuesta_validacion: '',
    password: '',
    confirmPassword: ''
  })
  
  const [message, setMessage] = useState(null)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  const { loading, error, userInfo } = useSelector((state) => state.auth)
  
  // Obtener la URL de redirección si existe
  const redirect = location.search ? location.search.split('=')[1] : ''
  
  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir según su rol
    if (userInfo) {
      if (userInfo.rol === 'admin') {
        navigate('/admin')
      } else if (userInfo.rol === 'cliente') {
        navigate(redirect ? `/${redirect}` : '/cliente')
      }
    }
  }, [navigate, userInfo, redirect])
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    
    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setMessage('Las contraseñas no coinciden')
      return
    }
    
    // Crear objeto con datos de cliente
    const clienteData = {
      nombre_completo: `${formData.nombre} ${formData.apellido}`,
      correo: formData.email,
      telefono: formData.telefono,
      documento_identidad: formData.documento_identidad,
      pregunta_validacion: formData.pregunta_validacion,
      respuesta_validacion: formData.respuesta_validacion
    }
    
    // Primero crear el cliente
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      }
      
      // Crear el cliente
      const { data } = await axios.post('/api/clientes', clienteData, config)
      
      // Si se crea el cliente correctamente, registrar el usuario
      if (data.success) {
        const userData = {
          nombre_usuario: formData.email, // Usar el email como nombre de usuario
          password: formData.password,
          rol: 'cliente',
          cliente_id: data.data._id // Asociar el usuario con el cliente creado
        }
        
        dispatch(register(userData))
      }
    } catch (error) {
      setMessage(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Crear Cuenta</h2>
        
        {message && <Message variant="error">{message}</Message>}
        {error && <Message variant="error">{error}</Message>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="pregunta_validacion" className="block text-sm font-medium text-gray-700 mb-1">Pregunta de Validación</label>
            <input
              type="text"
              id="pregunta_validacion"
              name="pregunta_validacion"
              value={formData.pregunta_validacion}
              onChange={handleChange}
              placeholder="Ej: ¿Cuál es el nombre de tu mascota?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="respuesta_validacion" className="block text-sm font-medium text-gray-700 mb-1">Respuesta de Validación</label>
            <input
              type="text"
              id="respuesta_validacion"
              name="respuesta_validacion"
              value={formData.respuesta_validacion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
                minLength="6"
              />
            </div>
          </div>
          
          <div className="mt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={loading}
            >
              {loading ? <Loader small /> : 'Registrarse'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link 
              to={redirect ? `/login?redirect=${redirect}` : '/login'}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Registro