import React, { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { XMarkIcon, Bars3Icon, HomeIcon, UserGroupIcon, CalendarIcon, TicketIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

const AdminLayout = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon, current: location.pathname === '/admin' },
    { name: 'Actividades', href: '/admin/actividades', icon: CalendarIcon, current: location.pathname.includes('/admin/actividades') },
    { name: 'Opciones', href: '/admin/opciones', icon: TicketIcon, current: location.pathname.includes('/admin/opciones') },
    { name: 'Clientes', href: '/admin/clientes', icon: UserGroupIcon, current: location.pathname.includes('/admin/clientes') },
    { name: 'Usuarios', href: '/admin/usuarios', icon: UserGroupIcon, current: location.pathname.includes('/admin/usuarios') },
    { name: 'Pedidos', href: '/admin/pedidos', icon: CurrencyDollarIcon, current: location.pathname.includes('/admin/pedidos') },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? 'visible' : 'invisible'}`} role="dialog" aria-modal="true">
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${sidebarOpen ? 'opacity-100 ease-out duration-300' : 'opacity-0 ease-in duration-200'}`} aria-hidden="true"></div>
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-primary-700 transition ${sidebarOpen ? 'translate-x-0 ease-out duration-300' : '-translate-x-full ease-in duration-200'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Cerrar sidebar</span>
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex-shrink-0 flex items-center px-4">
            <h1 className="text-white font-bold text-xl">Panel Admin</h1>
          </div>
          
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${item.current ? 'bg-primary-800 text-white' : 'text-white hover:bg-primary-600'}`}
                >
                  <item.icon className="mr-4 h-6 w-6 text-primary-300" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Dummy element to force sidebar to shrink to fit close icon */}
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-primary-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-white font-bold text-xl">Panel Admin</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${item.current ? 'bg-primary-800 text-white' : 'text-white hover:bg-primary-600'}`}
                >
                  <item.icon className="mr-3 h-6 w-6 text-primary-300" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 md:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              {navigation.find(item => item.current)?.name || 'Panel de Administración'}
            </h1>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{userInfo?.nombre_usuario}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout