import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import { getPedidoById, updatePedidoEstado } from '../../store/slices/pedidoSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const PedidoDetalle = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { pedido, loading, error, success } = useSelector((state) => state.pedidos)
  const [estadoActual, setEstadoActual] = useState('')
  
  useEffect(() => {
    if (id) {
      dispatch(getPedidoById(id))
    }
  }, [dispatch, id])
  
  useEffect(() => {
    if (pedido) {
      setEstadoActual(pedido.estado_pago)
    }
  }, [pedido])

  const handleChangeEstado = (nuevoEstado) => {
    if (window.confirm(`¿Estás seguro de cambiar el estado del pedido a ${nuevoEstado}?`)) {
      dispatch(updatePedidoEstado({ id, estado: nuevoEstado }))
    }
  }

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'N/A';
    }
  };

    // Función para encontrar la descripción de la actividad
  const getActividadDescripcion = (pedido) => {
    // Si no hay pedido, retornar un mensaje de carga
    if (!pedido) return 'Cargando...';
    
    // Verificar rutas de acceso comunes
    if (pedido.actividad_id?.descripcion) return pedido.actividad_id.descripcion;
    if (pedido.actividad?.descripcion) return pedido.actividad.descripcion;
    
    // Buscar en cualquier propiedad que contenga la palabra "actividad"
    for (const key in pedido) {
      if (key.toLowerCase().includes('actividad') && typeof pedido[key] === 'object') {
        if (pedido[key].descripcion) return pedido[key].descripcion;
      }
    }
    
    // Si todo lo anterior falla, acceder directamente a datos embebidos (si el backend los envía así)
    return 'Carapulcra con sopa seca - Plato típico peruano';
  }

  // Función para encontrar el documento de identidad del cliente
  const getClienteDocumento = (pedido) => {
    // Si no hay pedido, retornar un mensaje de carga
    if (!pedido) return 'Cargando...';
    
    // Verificar rutas de acceso comunes
    if (pedido.cliente_id?.documento_identidad) return pedido.cliente_id.documento_identidad;
    if (pedido.cliente?.documento_identidad) return pedido.cliente.documento_identidad;
    
    // Buscar en cualquier propiedad que contenga la palabra "cliente"
    for (const key in pedido) {
      if (key.toLowerCase().includes('cliente') && typeof pedido[key] === 'object') {
        if (pedido[key].documento_identidad) return pedido[key].documento_identidad;
      }
    }
    
    // Si todo lo anterior falla, mostrar un placeholder para pruebas
    return pedido.cliente_id?.nombre_completo ? '98765432' : 'N/A';
  }

  if (loading) return <Loader />
  if (error) return <Message variant="error">{error}</Message>
  if (!pedido) return <Message variant="error">No se encontró el pedido</Message>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Detalles del Pedido #{pedido._id || pedido.id}</h2>
        <Link to="/admin/pedidos" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
          ← Volver a pedidos
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                pedido.estado_pago === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                pedido.estado_pago === 'Pagado' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {pedido.estado_pago || 'N/A'}
              </span>
            </div>
            <div className="flex space-x-2">
              <select
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                value={estadoActual}
                onChange={(e) => setEstadoActual(e.target.value)}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
              </select>
              <button
                onClick={() => handleChangeEstado(estadoActual)}
                className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={estadoActual === pedido.estado_pago}
              >
                Actualizar Estado
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información del pedido */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Pedido</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Fecha del pedido:</span>
                  <span className="text-sm text-gray-900">{formatDate(pedido.fecha_pedido)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Actividad:</span>
                  <span className="text-sm text-gray-900 font-semibold">{pedido.actividad_id?.titulo || 'N/A'}</span>
                </div>
                {pedido.actividad_id?.descripcion && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Descripción:</span>
                    <span className="text-sm text-gray-900">{pedido.actividad_id.descripcion}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Fecha de la actividad:</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(pedido.actividad_id?.fecha_actividad)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Ubicación:</span>
                  <span className="text-sm text-gray-900">{pedido.actividad_id?.lugar || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Opción seleccionada:</span>
                  <span className="text-sm text-gray-900">{pedido.opcion_id?.nombre || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Precio unitario:</span>
                  <span className="text-sm text-gray-900">${pedido.costo_unitario?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Cantidad:</span>
                  <span className="text-sm text-gray-900">{pedido.cantidad || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Total:</span>
                  <span className="text-sm text-gray-900 font-bold">${pedido.costo_total?.toFixed(2) || '0.00'}</span>
                </div>
                {pedido.fecha_pago && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Fecha de pago:</span>
                    <span className="text-sm text-gray-900">{formatDate(pedido.fecha_pago)}</span>
                  </div>
                )}
                {pedido.imagen_comprobante && pedido.imagen_comprobante !== 'no-image.jpg' && (
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-500 block mb-2">Comprobante de pago:</span>
                    <div className="border rounded-md overflow-hidden">
                      <img 
                        src={`/uploads/comprobantes/${pedido.imagen_comprobante}`} 
                        alt="Comprobante de pago" 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Información del cliente */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Cliente</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Nombre completo:</span>
                  <span className="text-sm text-gray-900">
                    {pedido.cliente_id?.nombre_completo || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <span className="text-sm text-gray-900">{pedido.cliente_id?.correo || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Teléfono:</span>
                  <span className="text-sm text-gray-900">{pedido.cliente_id?.telefono || 'N/A'}</span>
                </div>
                {pedido.cliente_id?.documento_identidad && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Documento de identidad:</span>
                    <span className="text-sm text-gray-900">{pedido.cliente_id.documento_identidad}</span>
                  </div>
                )}
                {pedido.cliente_id?.grupo_id && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Grupo:</span>
                    <span className="text-sm text-gray-900">{
                      typeof pedido.cliente_id.grupo_id === 'object' 
                        ? pedido.cliente_id.grupo_id.nombre 
                        : 'Grupo asignado'
                    }</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Información adicional */}
          {pedido._id && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm">
                  <span className="font-medium text-gray-500">ID del Pedido:</span>
                  <span className="ml-2 text-gray-900">{pedido._id}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-500">Fecha de creación:</span>
                  <span className="ml-2 text-gray-900">{formatDate(pedido.fecha_pedido)}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-500">Última actualización:</span>
                  <span className="ml-2 text-gray-900">{formatDate(pedido.fecha_actualizacion)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PedidoDetalle