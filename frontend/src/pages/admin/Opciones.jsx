import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { getOpciones, deleteOpcion } from '../../store/slices/opcionSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const Opciones = () => {
  const dispatch = useDispatch()
  const { opciones, loading, error, success } = useSelector((state) => state.opcion)
  const [filteredOpciones, setFilteredOpciones] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActividad, setFilterActividad] = useState('')
  
  useEffect(() => {
    dispatch(getOpciones())
  }, [dispatch, success])
  
  useEffect(() => {
    if (opciones) {
      // Filtrar opciones por término de búsqueda y actividad
      let filtered = [...opciones]
      
      if (searchTerm) {
        filtered = filtered.filter(opcion => 
          opcion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opcion.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      if (filterActividad) {
        filtered = filtered.filter(opcion => opcion.actividad_id === parseInt(filterActividad))
      }
      
      setFilteredOpciones(filtered)
    }
  }, [opciones, searchTerm, filterActividad])

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta opción? Esta acción no se puede deshacer.')) {
      dispatch(deleteOpcion(id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Gestión de Opciones</h2>
        <Link
          to="/admin/opciones/crear"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Crear Nueva Opción
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
              placeholder="Buscar opciones..."
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
              {/* Aquí se podrían mapear las actividades disponibles */}
              {opciones && [...new Set(opciones.map(opcion => opcion.actividad_id))].map(actividadId => {
                const actividad = opciones.find(o => o.actividad_id === actividadId)?.actividad
                return actividad ? (
                  <option key={actividadId} value={actividadId}>
                    {actividad.nombre}
                  </option>
                ) : null
              })}
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : filteredOpciones.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">
            {searchTerm || filterActividad ? 
              `No se encontraron opciones con los filtros aplicados.` : 
              'No hay opciones disponibles.'}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponible</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOpciones.map((opcion) => (
                  <tr key={opcion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{opcion.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {opcion.descripcion.length > 50 
                        ? `${opcion.descripcion.substring(0, 50)}...` 
                        : opcion.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${opcion.precio.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {opcion.actividad ? opcion.actividad.nombre : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${opcion.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {opcion.disponible ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/admin/opciones/editar/${opcion.id}`} className="text-primary-600 hover:text-primary-900 mr-4">
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(opcion.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
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

export default Opciones