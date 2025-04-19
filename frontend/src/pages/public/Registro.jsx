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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
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
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
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
      <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Crear Cuenta</h2>
        
        {message && <Message variant="error">{message}</Message>}
        {error && <Message variant="error">{error}</Message>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="transition-all duration-300 hover:translate-y-[-2px]">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                required
                placeholder="Ingrese su nombre"
              />
            </div>
            
            <div className="transition-all duration-300 hover:translate-y-[-2px]">
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                required
                placeholder="Ingrese su apellido"
              />
            </div>
          </div>
          
          <div className="transition-all duration-300 hover:translate-y-[-2px]">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              required
              placeholder="Ingrese su email"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="transition-all duration-300 hover:translate-y-[-2px]">
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                required
                placeholder="Ingrese su teléfono"
              />
            </div>
            
            <div className="transition-all duration-300 hover:translate-y-[-2px]">
              <label htmlFor="documento_identidad" className="block text-sm font-medium text-gray-700 mb-1">Documento de Identidad</label>
              <input
                type="text"
                id="documento_identidad"
                name="documento_identidad"
                value={formData.documento_identidad}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                required
                placeholder="Ingrese su documento"
              />
            </div>
          </div>
          
          <div className="transition-all duration-300 hover:translate-y-[-2px]">
            <label htmlFor="pregunta_validacion" className="block text-sm font-medium text-gray-700 mb-1">Pregunta de Validación</label>
            <input
              type="text"
              id="pregunta_validacion"
              name="pregunta_validacion"
              value={formData.pregunta_validacion}
              onChange={handleChange}
              placeholder="Ej: ¿Cuál es el nombre de tu mascota?"
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              required
            />
          </div>
          
          <div className="transition-all duration-300 hover:translate-y-[-2px]">
            <label htmlFor="respuesta_validacion" className="block text-sm font-medium text-gray-700 mb-1">Respuesta de Validación</label>
            <input
              type="text"
              id="respuesta_validacion"
              name="respuesta_validacion"
              value={formData.respuesta_validacion}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              required
              placeholder="Ingrese su respuesta"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="transition-all duration-300 hover:translate-y-[-2px]">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  required
                  minLength="6"
                  placeholder="Mínimo 6 caracteres"
                />
                <button 
                  type="button" 
                  onClick={toggleShowPassword}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-primary-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="transition-all duration-300 hover:translate-y-[-2px]">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  required
                  minLength="6"
                  placeholder="Confirme su contraseña"
                />
                <button 
                  type="button" 
                  onClick={toggleShowConfirmPassword}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-primary-600 transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
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
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
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