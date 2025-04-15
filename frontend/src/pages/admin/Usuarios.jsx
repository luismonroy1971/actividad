import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const Usuarios = () => {
  const dispatch = useDispatch()
  const { userInfo } = useSelector((state) => state.auth)
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  
  useEffect(() => {
    fetchUsuarios()
  }, [success])
  
  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      
      const { data } = await axios.get('/api/usuarios', config)
      setUsuarios(data)
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

  const handleDelete = async (id) => {
    if (confirmDelete === id) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
        
        await axios.delete(`/api/usuarios/${id}`, config)
        setSuccess(!success) // Toggle para refrescar la lista
        setConfirmDelete(null)
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        )
      }
    } else {
      setConfirmDelete(id)
    }
  }

  const getRolBadgeClass = (rol) => {
    return rol === 'admin' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-green-100 text-green-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Gestión de Usuarios</h2>
        
        <Link 
          to="/admin/usuarios/crear" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nuevo Usuario
        </Link>
      </div>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : usuarios.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No hay usuarios disponibles.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente Asociado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acceso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{usuario.nombre_usuario}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRolBadgeClass(usuario.rol)}`}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.cliente_id ? (
                        <Link to={`/admin/clientes/editar/${usuario.cliente_id}`} className="text-primary-600 hover:text-primary-900">
                          Ver cliente
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.ultimo_acceso ? new Date(usuario.ultimo_acceso).toLocaleString() : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link to={`/admin/usuarios/editar/${usuario._id}`} className="text-primary-600 hover:text-primary-900">
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(usuario._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {confirmDelete === usuario._id ? '¿Confirmar?' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Usuarios