import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchActividades, deleteActividad } from '../../store/slices/actividadSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import formatDate from '../../utils/dateFormatter';

const Actividades = () => {
  const dispatch = useDispatch()
  
  // Obtener el estado del slice de actividades
  const { actividades, loading, error, success } = useSelector((state) => state.actividades)
  
  const [filteredActividades, setFilteredActividades] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  
  // Cargar actividades al montar el componente o cuando cambia success
  useEffect(() => {
    dispatch(fetchActividades())
    console.log("Solicitando actividades al API...")
  }, [dispatch, success])
  
  // Procesar y filtrar actividades cuando cambian
  useEffect(() => {
    console.log('Actividades recibidas en el componente:', actividades);
    
    // Si no hay actividades, no procesamos
    if (!actividades) {
      console.log('No hay actividades disponibles');
      setFilteredActividades([]);
      return;
    }
    
    // Aplicar filtro por término de búsqueda
    const filtered = actividades.filter(actividad => 
      (actividad?.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       actividad?.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    console.log('Actividades filtradas:', filtered);
    setFilteredActividades(filtered);
  }, [actividades, searchTerm])

  const handleDelete = (id) => {
    if (confirmDelete === id) {
      dispatch(deleteActividad(id))
        .unwrap()
        .then(() => {
          // Eliminación exitosa
          setConfirmDelete(null);
        })
        .catch((error) => {
          // Manejar el error
          console.error('Error al eliminar actividad:', error);
        });
    } else {
      setConfirmDelete(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Gestión de Actividades</h2>
        
        <Link 
          to="/admin/actividades/crear" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nueva Actividad
        </Link>
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
                      <Link to={`/admin/actividades/editar/${actividad._id}`} className="text-primary-600 hover:text-primary-900 mr-4">
                        Editar
                      </Link>
                      <Link to={`/actividades/${actividad._id}`} className="text-gray-600 hover:text-gray-900 mr-4">
                        Ver
                      </Link>
                      <button 
                        onClick={() => handleDelete(actividad._id)} 
                        className={`${confirmDelete === actividad._id ? 'text-red-600 font-medium' : 'text-gray-600 hover:text-red-900'}`}
                      >
                        {confirmDelete === actividad._id ? '¿Confirmar?' : 'Eliminar'}
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

export default Actividades