import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchActividades } from '../../store/slices/actividadSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const Home = () => {
  const dispatch = useDispatch()
  const { actividades, loading, error } = useSelector((state) => state.actividades)
  const [filteredActividades, setFilteredActividades] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
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
      // Si actividades no existe o no es un array, inicializar filteredActividades como array vacío
      setFilteredActividades([])
    }
  }, [actividades, searchTerm])

  // Función para formatear la URL de la imagen
  const getImageUrl = (imageName) => {
    if (!imageName || imageName === 'no-photo.jpg') {
      return 'https://via.placeholder.com/300x200?text=No+imagen+disponible'
    }
    
    // Si la imagen ya tiene una URL completa (comienza con http o https o data:)
    if (imageName.startsWith('http') || imageName.startsWith('data:')) {
      return imageName
    }
    
    // De lo contrario, construir la URL completa
    // Esta es la ruta desde la raíz del servidor hacia la carpeta de imágenes
    return `/uploads/actividades/${imageName}`
  }

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="bg-primary-700 text-white rounded-lg shadow-lg p-8 mb-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Actividades Pro Fondos</h1>
          <p className="text-lg md:text-xl mb-6">Encuentra y participa en actividades para recaudar fondos para causas importantes</p>
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Buscar actividades..."
              className="w-full px-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-2 top-2 bg-primary-600 text-white p-1 rounded-full hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Actividades */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Actividades Disponibles</h2>
        
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="error">{error}</Message>
        ) : filteredActividades.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 mb-4">
              {searchTerm ? `No se encontraron actividades para "${searchTerm}"` : 'No hay actividades disponibles en este momento.'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActividades.map((actividad) => (
              <div key={actividad._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={getImageUrl(actividad.imagen_promocional)} 
                    alt={actividad.titulo} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(`Error cargando imagen: ${e.target.src}`);
                      e.target.onerror = null; 
                      e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible'
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{actividad.titulo}</h3>
                    <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      ${actividad.precio ? actividad.precio.toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(actividad.fecha_actividad).toLocaleDateString()} | {actividad.lugar}
                  </p>
                  <p className="text-gray-700 mb-4 line-clamp-3">{actividad.descripcion}</p>
                  <Link 
                    to={`/actividades/${actividad._id}`}
                    className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Sección informativa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-primary-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Actividades Programadas</h3>
          <p className="text-gray-600">Encuentra actividades con fechas y horarios que se ajusten a tu disponibilidad.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-primary-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Apoya Causas Importantes</h3>
          <p className="text-gray-600">Tu participación ayuda a recaudar fondos para proyectos y causas que marcan la diferencia.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-primary-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Proceso Sencillo</h3>
          <p className="text-gray-600">Registro fácil, selección de opciones y pago seguro para participar en las actividades.</p>
        </div>
      </div>
    </div>
  )
}

export default Home