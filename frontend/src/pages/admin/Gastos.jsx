import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchActividades } from '../../store/slices/actividadSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import formatDate from '../../utils/dateFormatter'

const Gastos = () => {
  const dispatch = useDispatch()
  const { actividades, loading, error } = useSelector((state) => state.actividades)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredActividades, setFilteredActividades] = useState([])
  
  useEffect(() => {
    dispatch(fetchActividades())
  }, [dispatch])
  
  useEffect(() => {
    if (actividades && Array.isArray(actividades)) {
      // Filtrar actividades por término de búsqueda
      const filtered = actividades.filter(actividad => 
        actividad.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        actividad.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredActividades(filtered)
    } else {
      setFilteredActividades([])
    }
  }, [actividades, searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Gestión Financiera de Actividades</h2>
      </div>
      
      {/* Buscador */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar actividades..."
            className="pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : filteredActividades.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">
            {searchTerm ? `No se encontraron actividades para "${searchTerm}"` : 'No hay actividades disponibles.'}
          </p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              Limpiar búsqueda
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActividades.map((actividad) => (
                  <tr key={actividad._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{actividad.titulo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(actividad.fecha_actividad)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{actividad.lugar}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{actividad.estado}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/admin/actividades/${actividad._id}/gastos`} className="text-primary-600 hover:text-primary-900 mr-4">
                        Ver Gastos
                      </Link>
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

export default Gastos