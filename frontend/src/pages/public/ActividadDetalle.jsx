import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getActividadById } from '../../store/slices/actividadSlice'
import { getOpciones } from '../../store/slices/opcionSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import formatDate from '../../utils/dateFormatter';

const ActividadDetalle = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { userInfo } = useSelector((state) => state.auth)
  const { actividad, loading: actividadLoading, error: actividadError } = useSelector((state) => state.actividades || {})
  const { opciones = [], loading: opcionesLoading = false, error: opcionesError = null } = useSelector((state) => state.opciones || {})
  
  const [actividadData, setActividadData] = useState(null)
  const [opcionesActividad, setOpcionesActividad] = useState([])
  const [cantidades, setCantidades] = useState({})
  
  // Cargar la actividad específica y opciones al montar
  useEffect(() => {
    if (id) {
      dispatch(getActividadById(id))
      dispatch(getOpciones())
    }
  }, [dispatch, id])
  
  // Actualizar actividadData cuando se carga actividad
  useEffect(() => {
    if (actividad) {
      // Determinar si la actividad está en actividad.data o directamente en actividad
      const data = actividad.data ? actividad.data : actividad
      setActividadData(data)
    }
  }, [actividad])
  
  // Filtrar opciones para esta actividad
  useEffect(() => {
    if (opciones && opciones.length > 0 && actividadData) {
      // Intentar filtrar por _id o id dependiendo de la estructura
      const actividadId = actividadData._id || actividadData.id
      
      console.log('Actividad ID:', actividadId)
      console.log('Opciones disponibles:', opciones)
      
      // Extraer las opciones del objeto 'data' si existe
      const opcionesData = Array.isArray(opciones.data) ? opciones.data : opciones
      
      const opcionesFiltradas = opcionesData.filter(opcion => {
        // Extraer el ID de actividad de la opción, considerando diferentes estructuras posibles
        let opcionActividadId = null
        
        // Caso 1: actividad_id es un string directo
        if (opcion.actividad_id && typeof opcion.actividad_id === 'string') {
          opcionActividadId = opcion.actividad_id
        }
        // Caso 2: actividad_id es un objeto con _id
        else if (opcion.actividad_id && typeof opcion.actividad_id === 'object' && opcion.actividad_id._id) {
          opcionActividadId = opcion.actividad_id._id
        }
        // Caso 3: actividad es un objeto con _id
        else if (opcion.actividad && opcion.actividad._id) {
          opcionActividadId = opcion.actividad._id
        }
        // Caso 4: actividad es un objeto con id
        else if (opcion.actividad && opcion.actividad.id) {
          opcionActividadId = opcion.actividad.id
        }
        
        // Comparar IDs como strings para evitar problemas de tipo
        return String(opcionActividadId) === String(actividadId)
      })
      
      console.log('Opciones filtradas:', opcionesFiltradas)
      setOpcionesActividad(opcionesFiltradas)
      
      // Inicializar cantidades a 0
      const cantidadesIniciales = {}
      opcionesFiltradas.forEach(opcion => {
        cantidadesIniciales[opcion._id || opcion.id] = 0
      })
      setCantidades(cantidadesIniciales)
    }
  }, [opciones, actividadData])
  
  // Función para redirigir a la página de realizar pedido
  const handleRealizarPedido = () => {
    if (!userInfo) {
      navigate('/login?redirect=actividades/' + id)
      return
    }
    
    navigate(`/cliente/realizar-pedido/${id}`)
  }

  if (actividadLoading || opcionesLoading) return <Loader />
  if (actividadError) return <Message variant="error">{actividadError}</Message>
  if (opcionesError) return <Message variant="error">{opcionesError}</Message>
  if (!actividadData) return (
    <div className="container mx-auto py-8">
      <Message variant="error">
        No se encontró la actividad
        <div className="mt-4">
          <Link to="/" className="text-primary-600 hover:text-primary-800">
            Volver al inicio
          </Link>
        </div>
      </Message>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Información de la actividad */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {actividadData.imagen_promocional && actividadData.imagen_promocional !== 'no-photo.jpg' ? (
          <div className="h-64 bg-gray-200 overflow-hidden">
            <img 
              src={`/uploads/actividades/${actividadData.imagen_promocional}`} 
              alt={actividadData.titulo} 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Error al cargar imagen:', e);
                e.target.src = 'https://via.placeholder.com/800x400?text=Imagen+no+disponible';
              }}
            />
          </div>
        ) : (
          <div className="h-64 bg-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{actividadData.titulo || 'Sin título'}</h1>
              <p className="text-sm text-gray-500 mb-2">
                <span className="mr-3">
                  <i className="far fa-calendar-alt mr-1"></i>
                  {formatDate(actividadData.fecha_actividad)}
                </span>
                {actividadData.lugar && (
                  <span>
                    <i className="fas fa-map-marker-alt mr-1"></i>
                    {actividadData.lugar}
                  </span>
                )}
              </p>
            </div>
            
            <div className="mt-2 md:mt-0 bg-primary-100 text-primary-800 text-lg font-semibold px-3 py-1 rounded-md">
              ${(actividadData.precio || 0).toFixed(2)}
            </div>
          </div>
          
          <div className="prose max-w-none mb-6">
            <p>{actividadData.descripcion || 'Sin descripción'}</p>
          </div>
          
          {actividadData.requisitos && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Requisitos</h3>
              <p className="text-gray-700">{actividadData.requisitos}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Botón de reserva */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Opciones Disponibles</h2>
            
            <button
              onClick={handleRealizarPedido}
              className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Realizar Pedido
            </button>
          </div>
          
          {opcionesActividad.length === 0 ? (
            <p className="text-gray-500 mt-4">No hay opciones disponibles para esta actividad.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {opcionesActividad.map((opcion) => {
                const opcionId = opcion._id || opcion.id;
                return (
                  <div key={opcionId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <div className="text-base font-medium text-gray-900">{opcion.nombre || opcion.titulo || 'Sin nombre'}</div>
                      <div className="text-sm text-gray-500">{opcion.descripcion || 'Sin descripción'}</div>
                    </div>
                    <div className="text-sm font-medium text-primary-600">${(opcion.precio || 0).toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActividadDetalle