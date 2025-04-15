import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const AdminActividades = () => {
  const navigate = useNavigate()
  const { userInfo } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [actividades, setActividades] = useState([])
  const [selectedUsuario, setSelectedUsuario] = useState('')
  const [selectedActividades, setSelectedActividades] = useState([])
  
  // Solo permitir acceso a superadmin
  useEffect(() => {
    if (!userInfo || userInfo.rol !== 'superadmin') {
      navigate('/admin')
    }
  }, [userInfo, navigate])
  
  useEffect(() => {
    fetchUsuarios()
    fetchActividades()
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
      // Filtrar solo usuarios con rol admin_actividad
      const adminActividades = data.filter(usuario => usuario.rol === 'admin_actividad')
      setUsuarios(adminActividades)
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
  
  const fetchActividades = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      
      const { data } = await axios.get('/api/actividades', config)
      setActividades(data.data || [])
    } catch (error) {
      console.error('Error al cargar actividades:', error)
    }
  }
  
  const handleUsuarioChange = async (e) => {
    const usuarioId = e.target.value
    setSelectedUsuario(usuarioId)
    
    if (usuarioId) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
        
        const { data } = await axios.get(`/api/usuarios/${usuarioId}`, config)
        setSelectedActividades(data.actividades_administradas || [])
      } catch (error) {
        console.error('Error al cargar actividades del usuario:', error)
      }
    } else {
      setSelectedActividades([])
    }
  }
  
  const handleActividadToggle = (actividadId) => {
    setSelectedActividades(prevActividades => {
      if (prevActividades.includes(actividadId)) {
        return prevActividades.filter(id => id !== actividadId)
      } else {
        return [...prevActividades, actividadId]
      }
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedUsuario) {
      setError('Por favor seleccione un usuario')
      return
    }
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      
      await axios.put(`/api/usuarios/${selectedUsuario}/actividades`, {
        actividades_administradas: selectedActividades
      }, config)
      
      setSuccess(!success) // Toggle para refrescar la lista
      setError(null)
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    }
  }
  
  const handleCrearAdminActividad = () => {
    navigate('/admin/usuarios/crear', { state: { preselectedRol: 'admin_actividad' } })
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Administradores por Actividad
          </h2>
          <p className="text-sm text-gray-500">
            Asigne actividades a los administradores específicos
          </p>
        </div>
        
        <button 
          onClick={handleCrearAdminActividad}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Crear Admin de Actividad
        </button>
      </div>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Administrador de Actividad
              </label>
              <select
                id="usuario"
                name="usuario"
                value={selectedUsuario}
                onChange={handleUsuarioChange}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">-- Seleccionar Usuario --</option>
                {usuarios.map(usuario => (
                  <option key={usuario._id} value={usuario._id}>
                    {usuario.nombre_usuario}
                  </option>
                ))}
              </select>
              
              {usuarios.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  No hay administradores de actividad disponibles. Cree uno primero.
                </p>
              )}
            </div>
            
            {selectedUsuario && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actividades Asignadas</h3>
                
                {actividades.length === 0 ? (
                  <p className="text-gray-500">No hay actividades disponibles.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {actividades.map(actividad => (
                      <div key={actividad._id} className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`actividad-${actividad._id}`}
                            name={`actividad-${actividad._id}`}
                            type="checkbox"
                            checked={selectedActividades.includes(actividad._id)}
                            onChange={() => handleActividadToggle(actividad._id)}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`actividad-${actividad._id}`} className="font-medium text-gray-700">
                            {actividad.titulo}
                          </label>
                          <p className="text-gray-500">{new Date(actividad.fecha_actividad).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Guardar Asignaciones
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
      
      {success && (
        <Message variant="success">
          Las actividades han sido asignadas correctamente al administrador.
        </Message>
      )}
    </div>
  )
}

export default AdminActividades