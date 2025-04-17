import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchActividades } from '../../store/slices/actividadSlice'
import { getOpciones } from '../../store/slices/opcionSlice'
import { createPedido } from '../../store/slices/pedidoSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const ActividadDetalle = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { userInfo } = useSelector((state) => state.auth)
  //const { actividades, loading: actividadLoading, error: actividadError } = useSelector((state) => state.actividades)
  //const { opciones, loading: opcionesLoading, error: opcionesError } = useSelector((state) => state.opcion)
  //const { loading: pedidoLoading, success: pedidoSuccess, error: pedidoError } = useSelector((state) => state.pedido)
  const { actividades = [], loading: actividadLoading = false, error: actividadError = null } = useSelector((state) => state.actividades || {});
  const { opciones = [], loading: opcionesLoading = false, error: opcionesError = null } = useSelector((state) => state.opcion || {});
  const { loading: pedidoLoading = false, success: pedidoSuccess = false, error: pedidoError = null } = useSelector((state) => state.pedido || {});
  
  const [actividad, setActividad] = useState(null)
  const [opcionesActividad, setOpcionesActividad] = useState([])
  const [seleccionadas, setSeleccionadas] = useState([])
  const [cantidades, setCantidades] = useState({})
  const [total, setTotal] = useState(0)
  const [notas, setNotas] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  
  useEffect(() => {
    dispatch(fetchActividades())
    dispatch(getOpciones())
  }, [dispatch])
  
  useEffect(() => {
    if (actividades && id) {
      const actividadEncontrada = actividades.find(a => a.id === parseInt(id))
      setActividad(actividadEncontrada)
    }
  }, [actividades, id])
  
  useEffect(() => {
    if (opciones && actividad) {
      // Filtrar opciones para esta actividad
      const opcionesFiltradas = opciones.filter(opcion => opcion.actividad_id === actividad.id)
      setOpcionesActividad(opcionesFiltradas)
      
      // Inicializar cantidades a 0
      const cantidadesIniciales = {}
      opcionesFiltradas.forEach(opcion => {
        cantidadesIniciales[opcion.id] = 0
      })
      setCantidades(cantidadesIniciales)
    }
  }, [opciones, actividad])
  
  useEffect(() => {
    // Calcular total basado en opciones seleccionadas y cantidades
    let nuevoTotal = 0
    seleccionadas.forEach(opcionId => {
      const opcion = opcionesActividad.find(o => o.id === opcionId)
      if (opcion) {
        nuevoTotal += opcion.precio * cantidades[opcionId]
      }
    })
    setTotal(nuevoTotal)
  }, [seleccionadas, cantidades, opcionesActividad])
  
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
      const opcion = opcionesActividad.find(o => o.id === opcionId)
      return {
        opcion_id: opcionId,
        cantidad: cantidades[opcionId],
        precio_unitario: opcion.precio
      }
    })
    
    // Crear pedido
    const pedidoData = {
      cliente_id: userInfo.id,
      actividad_id: actividad.id,
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
  if (!actividad) return <Message variant="error">No se encontró la actividad</Message>

  return (
    <div className="max-w-4xl mx-auto">
      {/* Información de la actividad */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {actividad.imagen && (
          <div className="h-64 bg-gray-200 overflow-hidden">
            <img 
              src={actividad.imagen} 
              alt={actividad.nombre} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{actividad.nombre}</h1>
              <p className="text-sm text-gray-500 mb-2">
                <span className="mr-3">
                  <i className="far fa-calendar-alt mr-1"></i>
                  {new Date(actividad.fecha).toLocaleDateString()}
                </span>
                {actividad.ubicacion && (
                  <span>
                    <i className="fas fa-map-marker-alt mr-1"></i>
                    {actividad.ubicacion}
                  </span>
                )}
              </p>
            </div>
            
            <div className="mt-2 md:mt-0 bg-primary-100 text-primary-800 text-lg font-semibold px-3 py-1 rounded-md">
              ${actividad.precio.toFixed(2)}
            </div>
          </div>
          
          <div className="prose max-w-none mb-6">
            <p>{actividad.descripcion}</p>
          </div>
          
          {actividad.requisitos && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Requisitos</h3>
              <p className="text-gray-700">{actividad.requisitos}</p>
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
                  {opcionesActividad.map((opcion) => (
                    <div key={opcion.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id={`opcion-${opcion.id}`}
                          checked={seleccionadas.includes(opcion.id)}
                          onChange={() => handleCheckboxChange(opcion.id)}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                        />
                        <label htmlFor={`opcion-${opcion.id}`} className="ml-3">
                          <div className="text-base font-medium text-gray-900">{opcion.nombre}</div>
                          <div className="text-sm text-gray-500">{opcion.descripcion}</div>
                          <div className="text-sm font-medium text-primary-600">${opcion.precio.toFixed(2)}</div>
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <label htmlFor={`cantidad-${opcion.id}`} className="sr-only">Cantidad</label>
                        <input
                          type="number"
                          id={`cantidad-${opcion.id}`}
                          value={cantidades[opcion.id] || 0}
                          onChange={(e) => handleCantidadChange(opcion.id, e.target.value)}
                          min="0"
                          className="w-16 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-center"
                          disabled={!seleccionadas.includes(opcion.id)}
                        />
                      </div>
                    </div>
                  ))}
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