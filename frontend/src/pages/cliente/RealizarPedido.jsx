import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getActividadById } from '../../store/slices/actividadSlice'
import { getOpciones } from '../../store/slices/opcionSlice'
import { createPedido } from '../../store/slices/pedidoSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import formatDate from '../../utils/dateFormatter'

const RealizarPedido = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { userInfo } = useSelector((state) => state.auth)
  const { actividad, loading: actividadLoading, error: actividadError } = useSelector((state) => state.actividades || {})
  const { opciones = [], loading: opcionesLoading = false, error: opcionesError = null } = useSelector((state) => state.opciones || {})
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
      dispatch(getOpciones({ actividad_id: id }))
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
      
      // Extraer las opciones del objeto 'data' si existe
      const opcionesData = Array.isArray(opciones.data) ? opciones.data : opciones
      
      // Imprimir para depuración
      console.log('Actividad ID:', actividadId)
      console.log('Opciones disponibles:', opcionesData)
      
      // Simplificar la lógica de filtrado para asegurar que funcione correctamente
      const opcionesFiltradas = opcionesData.filter(opcion => {
        const opcionActividadId = 
          (opcion.actividad_id && typeof opcion.actividad_id === 'string') ? opcion.actividad_id :
          (opcion.actividad_id && opcion.actividad_id._id) ? opcion.actividad_id._id :
          (opcion.actividad && opcion.actividad._id) ? opcion.actividad._id :
          (opcion.actividad && opcion.actividad.id) ? opcion.actividad.id : null;
        
        return String(opcionActividadId) === String(actividadId);
      })
      
      console.log('Opciones filtradas:', opcionesFiltradas)
      setOpcionesActividad(opcionesFiltradas)
      
      // Inicializar cantidades a 1 para que sean seleccionables inmediatamente
      const cantidadesIniciales = {}
      opcionesFiltradas.forEach(opcion => {
        const opcionId = opcion._id || opcion.id
        cantidadesIniciales[opcionId] = 1
        // Preseleccionar todas las opciones disponibles
        setSeleccionadas(prev => {
          if (!prev.includes(opcionId)) {
            return [...prev, opcionId]
          }
          return prev
        })
      })
      setCantidades(cantidadesIniciales)
    }
  }, [opciones, actividadData])
  
  // Calcular total
  useEffect(() => {
    let nuevoTotal = 0
    seleccionadas.forEach(opcionId => {
      const opcion = opcionesActividad.find(o => (o._id === opcionId || o.id === opcionId))
      if (opcion) {
        nuevoTotal += opcion.precio * cantidades[opcionId]
      }
    })
    setTotal(nuevoTotal)
  }, [seleccionadas, cantidades, opcionesActividad])
  
  // Redireccionar después de éxito
  useEffect(() => {
    if (pedidoSuccess) {
      // Mostrar mensaje de éxito antes de redirigir
      setTimeout(() => {
        navigate('/cliente/pedidos')
      }, 2000) // Esperar 2 segundos antes de redirigir
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
      const opcion = opcionesActividad.find(o => (o._id === opcionId || o.id === opcionId))
      return {
        opcion_id: opcionId,
        cantidad: cantidades[opcionId],
        precio_unitario: opcion.precio
      }
    })
    
    // Verificar que existe cliente_id en userInfo
    if (!userInfo.cliente_id) {
      alert('Error: No se encontró la información del cliente asociada a su cuenta')
      return
    }
    
    // Crear pedido
    const pedidoData = {
      cliente_id: userInfo.cliente_id, // Usar el ID del cliente relacionado al usuario
      actividad_id: actividadData._id || actividadData.id,
      opcion_id: seleccionadas[0], // Tomamos la primera opción seleccionada
      cantidad: cantidades[seleccionadas[0]], // Cantidad de la primera opción
      costo_unitario: opcionesActividad.find(o => (o._id === seleccionadas[0] || o.id === seleccionadas[0]))?.precio || 0,
      estado_pago: 'Pendiente',
      metodo_pago: metodoPago,
      notas
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Realizar Pedido</h2>
        <Link to="/" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
          ← Volver a actividades
        </Link>
      </div>
      
      {pedidoError && <Message variant="error">{pedidoError}</Message>}
      {pedidoSuccess && <Message variant="success">¡Pedido realizado con éxito! Redirigiendo a tus pedidos...</Message>}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          {/* Información de la actividad */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la Actividad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Nombre:</p>
                <p className="text-base text-gray-900">{actividadData.titulo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Fecha:</p>
                <p className="text-base text-gray-900">{formatDate(actividadData.fecha_actividad)}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500 mb-1">Descripción:</p>
                <p className="text-base text-gray-900">{actividadData.descripcion}</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Selección de opciones */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Selecciona las Opciones</h3>
              
              {opcionesActividad.length === 0 ? (
                <p className="text-gray-500">No hay opciones disponibles para esta actividad.</p>
              ) : (
                <div className="space-y-4">
                  {opcionesActividad.map((opcion) => {
                    const opcionId = opcion._id || opcion.id
                    return (
                      <div key={opcionId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`opcion-${opcionId}`}
                            checked={seleccionadas.includes(opcionId)}
                            onChange={() => handleCheckboxChange(opcionId)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`opcion-${opcionId}`} className="ml-3 block">
                            <span className="text-sm font-medium text-gray-900">{opcion.nombre}</span>
                            <span className="block text-sm text-gray-500">${opcion.precio.toFixed(2)}</span>
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <label htmlFor={`cantidad-${opcionId}`} className="sr-only">Cantidad</label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button 
                              type="button"
                              onClick={() => {
                                const nuevaCantidad = Math.max(0, (cantidades[opcionId] || 0) - 1)
                                handleCantidadChange(opcionId, nuevaCantidad)
                              }}
                              className="px-3 py-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                              disabled={!seleccionadas.includes(opcionId) || cantidades[opcionId] <= 0}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              id={`cantidad-${opcionId}`}
                              value={cantidades[opcionId] || 0}
                              onChange={(e) => handleCantidadChange(opcionId, e.target.value)}
                              min="0"
                              className="w-12 text-center border-0 focus:ring-0"
                              disabled={!seleccionadas.includes(opcionId)}
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                const nuevaCantidad = (cantidades[opcionId] || 0) + 1
                                handleCantidadChange(opcionId, nuevaCantidad)
                              }}
                              className="px-3 py-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                              disabled={!seleccionadas.includes(opcionId)}
                            >
                              +
                            </button>
                          </div>
                          
                          {seleccionadas.includes(opcionId) && cantidades[opcionId] > 0 && (
                            <span className="ml-4 text-sm font-medium text-gray-900">
                              ${(opcion.precio * cantidades[opcionId]).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
            {/* Resumen del pedido */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen del Pedido</h3>
              
              {seleccionadas.length === 0 ? (
                <p className="text-gray-500">No has seleccionado ninguna opción.</p>
              ) : (
                <div className="space-y-4">
                  {seleccionadas.map(opcionId => {
                    const opcion = opcionesActividad.find(o => (o._id === opcionId || o.id === opcionId))
                    if (!opcion || cantidades[opcionId] <= 0) return null
                    
                    return (
                      <div key={`resumen-${opcionId}`} className="flex justify-between">
                        <span className="text-sm text-gray-700">
                          {opcion.nombre} x {cantidades[opcionId]}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          ${(opcion.precio * cantidades[opcionId]).toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                  
                  <div className="pt-4 border-t border-gray-200 flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total:</span>
                    <span className="text-base font-medium text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Método de pago */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Método de Pago</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="efectivo"
                    name="metodoPago"
                    type="radio"
                    value="efectivo"
                    checked={metodoPago === 'efectivo'}
                    onChange={() => setMetodoPago('efectivo')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="efectivo" className="ml-3 block text-sm font-medium text-gray-700">
                    Efectivo
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="transferencia"
                    name="metodoPago"
                    type="radio"
                    value="transferencia"
                    checked={metodoPago === 'transferencia'}
                    onChange={() => setMetodoPago('transferencia')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="transferencia" className="ml-3 block text-sm font-medium text-gray-700">
                    Transferencia Bancaria
                  </label>
                </div>
              </div>
            </div>
            
            {/* Notas adicionales */}
            <div className="mb-8">
              <label htmlFor="notas" className="block text-lg font-medium text-gray-900 mb-4">
                Notas Adicionales (Opcional)
              </label>
              <textarea
                id="notas"
                name="notas"
                rows="3"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Agrega cualquier información adicional sobre tu pedido"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            {/* Botón de envío */}
            <div className="flex justify-end">
              <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={pedidoLoading || seleccionadas.length === 0 || pedidoSuccess}
            >
              {pedidoLoading ? (
                <>
                  <Loader small />
                  <span className="ml-2">Procesando...</span>
                </>
              ) : pedidoSuccess ? (
                'Pedido Realizado'
              ) : (
                'Realizar Pedido'
              )}
            </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RealizarPedido