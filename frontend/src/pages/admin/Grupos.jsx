import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { getGrupos, deleteGrupo } from '../../store/slices/grupoSlice'
import { fetchActividades } from '../../store/slices/actividadSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const Grupos = () => {
  const dispatch = useDispatch()
  const { grupos, loading, error, success } = useSelector((state) => state.grupos)
  const { actividades } = useSelector((state) => state.actividades)
  const [filteredGrupos, setFilteredGrupos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActividad, setFilterActividad] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  
  useEffect(() => {
    dispatch(getGrupos())
    dispatch(fetchActividades())
  }, [dispatch, success])
  
  // Procesar las actividades disponibles
  const getActividadesArray = () => {
    if (!actividades) return [];
    
    if (Array.isArray(actividades)) {
      return actividades;
    } else if (actividades.data && Array.isArray(actividades.data)) {
      return actividades.data;
    }
    
    return [];
  }
  
  useEffect(() => {
    // Determinar el array de grupos basado en la estructura recibida
    let gruposArray = []
    
    if (grupos) {
      if (Array.isArray(grupos)) {
        gruposArray = grupos
      } else if (grupos.data && Array.isArray(grupos.data)) {
        gruposArray = grupos.data
      }
    }
    
    if (gruposArray.length === 0) {
      setFilteredGrupos([])
      return
    }
    
    // Filtrar grupos por término de búsqueda
    let filtered = [...gruposArray]
    
    if (searchTerm) {
      filtered = filtered.filter(grupo => 
        grupo.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grupo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filterActividad) {
      filtered = filtered.filter(grupo => {
        // Comparar como strings para mayor seguridad
        const grupoActividadId = String(grupo.actividad_id || '');
        const filterActividadId = String(filterActividad || '');
        return grupoActividadId === filterActividadId;
      })
    }
    
    setFilteredGrupos(filtered)
  }, [grupos, searchTerm, filterActividad, actividades])

  // Función para obtener el nombre de la actividad por ID
  const getActividadNombre = (actividadId) => {
    if (!actividadId) {
      return 'Sin actividad asignada'
    }
    
    // Obtener array de actividades
    const actividadesArray = getActividadesArray();
    
    if (actividadesArray.length === 0) {
      return 'Actividad no disponible'
    }

    // Manejar diferentes formatos de ID de actividad
    let actividadEncontrada = null;
    
    // Caso 1: actividadId es un string o un ObjectId
    if (typeof actividadId === 'string' || typeof actividadId === 'number') {
      const actividadIdStr = String(actividadId);
      actividadEncontrada = actividadesArray.find(act => String(act._id) === actividadIdStr);
    }
    // Caso 2: actividadId es un objeto con _id
    else if (actividadId && typeof actividadId === 'object') {
      if (actividadId._id) {
        const actividadIdStr = String(actividadId._id);
        actividadEncontrada = actividadesArray.find(act => String(act._id) === actividadIdStr);
      }
    }
    
    if (actividadEncontrada) {
      return actividadEncontrada.titulo;
    } else {
      return 'Actividad no encontrada';
    }
  }

  const handleDelete = (id) => {
    if (confirmDelete === id) {
      dispatch(deleteGrupo(id))
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Gestión de Grupos</h2>
        <Link
          to="/admin/grupos/crear"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nuevo Grupo
        </Link>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Buscador */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar grupos..."
              className="pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filtro por actividad */}
          <div>
            <select
              className="focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={filterActividad}
              onChange={(e) => setFilterActividad(e.target.value)}
            >
              <option value="">Todas las actividades</option>
              {getActividadesArray().map(actividad => (
                <option key={actividad._id} value={actividad._id}>
                  {actividad.titulo}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : filteredGrupos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">
            {searchTerm || filterActividad ? 
              `No se encontraron grupos con los filtros aplicados.` : 
              'No hay grupos disponibles.'}
          </p>
          {(searchTerm || filterActividad) && (
            <button 
              onClick={() => {
                setSearchTerm('')
                setFilterActividad('')
              }}
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGrupos.map((grupo) => (
                  <tr key={grupo._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{grupo.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grupo.descripcion || 'Sin descripción'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getActividadNombre(grupo.actividad_id)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/admin/grupos/editar/${grupo._id}`} className="text-primary-600 hover:text-primary-900 mr-4">
                        Editar
                      </Link>
                      <button 
                        onClick={() => handleDelete(grupo._id)} 
                        className={`${confirmDelete === grupo._id ? 'text-red-600 font-medium' : 'text-gray-600 hover:text-red-900'}`}
                      >
                        {confirmDelete === grupo._id ? '¿Confirmar?' : 'Eliminar'}
                      </button>
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

export default Grupos