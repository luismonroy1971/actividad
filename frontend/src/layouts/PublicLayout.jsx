import React from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'

const PublicLayout = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-primary-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">Actividades Pro Fondos</Link>
            
            <div className="flex space-x-4 items-center">
              <Link to="/" className="hover:text-primary-200">Inicio</Link>
              
              {userInfo ? (
                <>
                  {userInfo.rol === 'admin' && (
                    <Link to="/admin" className="hover:text-primary-200">Panel Admin</Link>
                  )}
                  {userInfo.rol === 'cliente' && (
                    <Link to="/cliente" className="hover:text-primary-200">Mi Cuenta</Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="hover:text-primary-200"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-primary-200">Iniciar Sesión</Link>
                  <Link to="/registro" className="bg-white text-primary-700 px-3 py-1 rounded-md hover:bg-primary-100">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-bold">Actividades Pro Fondos</h3>
              <p className="text-sm text-gray-400">Organizando eventos para recaudar fondos</p>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Todos los derechos reservados
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout