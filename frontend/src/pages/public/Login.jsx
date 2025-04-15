import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../../store/slices/authSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const Login = () => {
  const [identificacion, setIdentificacion] = useState('')
  const [password, setPassword] = useState('')
  
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
  
  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(login({ identificacion, password }))
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Iniciar Sesión</h2>
        
        {error && <Message variant="error">{error}</Message>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identificacion" className="block text-sm font-medium text-gray-700 mb-1">Email o Nombre de Usuario</label>
            <input
              type="text"
              id="identificacion"
              value={identificacion}
              onChange={(e) => setIdentificacion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
              placeholder="Ingrese su email o nombre de usuario"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={loading}
            >
              {loading ? <Loader small /> : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link 
              to={redirect ? `/registro?redirect=${redirect}` : '/registro'}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login