import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import { getPedidos } from '../../store/slices/pedidoSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const PedidoDetalle = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { userInfo } = useSelector((state) => state.auth)
  const { pedidos, loading, error } = useSelector((state) => state.pedido)
  const [pedido, setPedido] = useState(null)
  
  useEffect(() => {
    dispatch(getPedidos())
  }, [dispatch])
  
  useEffect(() => {
    if (pedidos && id) {
      const pedidoEncontrado = pedidos.find(p => p.id === parseInt(id))
      
      // Verificar que el pedido pertenezca al cliente actual
      if (pedidoEncontrado && pedidoEncontrado.cliente_id === userInfo?.id) {
        setPedido(pedidoEncontrado)
      }
    }
  }, [pedidos, id, userInfo])

  if (loading) return <Loader />
  if (error) return <Message variant="error">{error}</Message>
  if (!pedido) return <Message variant="error">No se encontró el pedido o no tienes permiso para verlo</Message>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Detalles del Pedido #{pedido.id}</h2>
        <Link to="/cliente/pedidos" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
          ← Volver a mis pedidos
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información del pedido */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Pedido</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Estado:</span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    pedido.estado === 'completado' ? 'bg-green-100 text-green-800' :
                    pedido.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Fecha del pedido:</span>
                  <span className="text-sm text-gray-900">{new Date(pedido.fecha_pedido).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Actividad:</span>
                  <span className="text-sm text-gray-900">{pedido.actividad?.nombre || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Fecha de la actividad:</span>
                  <span className="text-sm text-gray-900">
                    {pedido.actividad?.fecha ? new Date(pedido.actividad.fecha).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Método de pago:</span>
                  <span className="text-sm text-gray-900">{pedido.metodo_pago || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            {/* Información del cliente */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Cliente</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Nombre:</span>
                  <span className="text-sm text-gray-900">{userInfo?.nombre || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Apellido:</span>
                  <span className="text-sm text-gray-900">{userInfo?.apellido || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <span className="text-sm text-gray-900">{userInfo?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Teléfono:</span>
                  <span className="text-sm text-gray-900">{userInfo?.telefono || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Detalles de las opciones seleccionadas */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Opciones Seleccionadas</h3>
            {pedido.detalles && pedido.detalles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opción</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unitario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pedido.detalles.map((detalle, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detalle.opcion?.nombre || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{detalle.cantidad}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${detalle.precio_unitario?.toFixed(2) || '0.00'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${(detalle.cantidad * detalle.precio_unitario).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan="3" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">Total:</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${pedido.total.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay opciones seleccionadas para este pedido.</p>
            )}
          </div>
          
          {/* Notas adicionales */}
          {pedido.notas && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notas adicionales</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-700">{pedido.notas}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PedidoDetalle