import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getActividadById } from '../../store/slices/actividadSlice'
import { getOpciones } from '../../store/slices/opcionSlice'
import { createPedido } from '../../store/slices/pedidoSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import formatDate from '../../utils/dateFormatter';

const ActividadDetalle = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { userInfo } = useSelector((state) => state.auth)
  const { actividad, loading: actividadLoading, error: actividadError } = useSelector((state) => state.actividades || {})
  const { opciones = [], loading: opcionesLoading = false, error: opcionesError = null } = useSelector((state) => state.opcion || {})
  const { loading: pedidoLoading = false, success: pedidoSuccess = false, error: pedidoError = null } = useSelector((state) => state.pedido || {})
  
  const [actividadData, setActividadData] = useState(null)
  const [opcionesActividad, setOpcionesActividad] = useState([])
  const [seleccionadas, setSeleccionadas] = useState([])
  const [cantidades, setCantidades] = useState({})
  const [total, setTotal] = useState(0)
  const [notas, setNotas] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  
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
  
  // Calcular total
  useEffect(() => {
    let nuevoTotal = 0
    seleccionadas.forEach(opcionId => {
      const opcion = opcionesActividad.find(o => o._id === opcionId || o.id === opcionId)
      if (opcion) {
        nuevoTotal += opcion.precio * cantidades[opcionId]
      }
    })
    setTotal(nuevoTotal)
  }, [seleccionadas, cantidades, opcionesActividad])
  
  // Redireccionar después de éxito
  useEffect(() => {
    if (pedidoSuccess) {
      navigate('/cliente/pedidos')
    }
  }, [pedidoSuccess, navigate])
    
  const handleCheckboxChange = (opcionId) => {
    if (seleccionadas.includes(opcionId)) {
      // Deseleccionar opción
      setSeleccionadas(seleccionadas.filter(id => id !== opcionId))
      setCantidades({
        ...cantidades,
        [opcionId]: 0
      })
    } else {
      // Seleccionar opción
      setSeleccionadas([...seleccionadas, opcionId])
      setCantidades({
        ...cantidades,
        [opcionId]: 1
      })
    }
  }
  
  const handleCantidadChange = (opcionId, cantidad) => {
    // Validar que la cantidad sea un número positivo
    const cantidadNum = parseInt(cantidad)
    if (isNaN(cantidadNum) || cantidadNum < 0) return
    
    setCantidades({
      ...cantidades,
      [opcionId]: cantidadNum
    })
    
    // Si la cantidad es mayor que 0, asegurarse de que la opción esté seleccionada
    if (cantidadNum > 0 && !seleccionadas.includes(opcionId)) {
      setSeleccionadas([...seleccionadas, opcionId])
    }
    // Si la cantidad es 0, deseleccionar la opción
    else if (cantidadNum === 0 && seleccionadas.includes(opcionId)) {
      setSeleccionadas(seleccionadas.filter(id => id !== opcionId))
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!userInfo) {
      navigate('/login?redirect=actividades/' + id)
      return
    }
    
    if (seleccionadas.length === 0) {
      alert('Por favor selecciona al menos una opción')
      return
    }
    
    // Crear detalles del pedido
    const detalles = seleccionadas.map(opcionId => {
      const opcion = opcionesActividad.find(o => o._id === opcionId || o.id === opcionId)
      return {
        opcion_id: opcionId,
        cantidad: cantidades[opcionId],
        precio_unitario: opcion.precio
      }
    })
    
    // Crear pedido
    const pedidoData = {
      cliente_id: userInfo._id || userInfo.id,
      actividad_id: actividadData._id || actividadData.id,
      fecha_pedido: new Date().toISOString(),
      estado: 'pendiente',
      metodo_pago: metodoPago,
      total,
      notas,
      detalles
    }
    
    dispatch(createPedido(pedidoData))
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
      
      {/* Formulario de pedido */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Realizar Pedido</h2>
          
          {pedidoError && <Message variant="error">{pedidoError}</Message>}
          
          <form onSubmit={handleSubmit}>
            {/* Opciones disponibles */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Opciones Disponibles</h3>
              
              {opcionesActividad.length === 0 ? (
                <p className="text-gray-500">No hay opciones disponibles para esta actividad.</p>
              ) : (
                <div className="space-y-4">
  {opcionesActividad.map((opcion) => {
    const opcionId = opcion._id || opcion.id;
    return (
      <div key={opcionId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
        <div className="flex items-start">
          <input
            type="checkbox"
            id={`opcion-${opcionId}`}
            checked={seleccionadas.includes(opcionId)}
            onChange={() => handleCheckboxChange(opcionId)}
            className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
          />
          <label htmlFor={`opcion-${opcionId}`} className="ml-3">
            <div className="text-base font-medium text-gray-900">{opcion.nombre || opcion.titulo || 'Sin nombre'}</div>
            <div className="text-sm text-gray-500">{opcion.descripcion || 'Sin descripción'}</div>
            <div className="text-sm font-medium text-primary-600">${(opcion.precio || 0).toFixed(2)}</div>
          </label>
        </div>
        
        <div className="flex items-center">
          <label htmlFor={`cantidad-${opcionId}`} className="sr-only">Cantidad</label>
          <input
            type="number"
            id={`cantidad-${opcionId}`}
            value={cantidades[opcionId] || 0}
            onChange={(e) => handleCantidadChange(opcionId, e.target.value)}
            min="0"
            className="w-16 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-center"
            disabled={!seleccionadas.includes(opcionId)}
          />
        </div>
      </div>
    );
  })}
</div>
              )}
            </div>
            
            {/* Método de pago */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Método de Pago</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="efectivo"
                    name="metodoPago"
                    value="efectivo"
                    checked={metodoPago === 'efectivo'}
                    onChange={() => setMetodoPago('efectivo')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="efectivo" className="ml-3 text-sm font-medium text-gray-700">Efectivo</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="transferencia"
                    name="metodoPago"
                    value="transferencia"
                    checked={metodoPago === 'transferencia'}
                    onChange={() => setMetodoPago('transferencia')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="transferencia" className="ml-3 text-sm font-medium text-gray-700">Transferencia Bancaria</label>
                </div>
              </div>
            </div>
            
            {/* Notas adicionales */}
            <div className="mb-6">
              <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales (opcional)</label>
              <textarea
                id="notas"
                rows="3"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Información adicional para tu pedido..."
              ></textarea>
            </div>
            
            {/* Resumen y total */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center text-base font-medium text-gray-900">
                <p>Total</p>
                <p>${total.toFixed(2)}</p>
              </div>
            </div>
            
            {/* Botón de envío */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={pedidoLoading || seleccionadas.length === 0}
              >
                {pedidoLoading ? 'Procesando...' : 'Realizar Pedido'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ActividadDetalle