import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchActividades } from '../../store/slices/actividadSlice'
import { getPedidos } from '../../store/slices/pedidoSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { userInfo } = useSelector((state) => state.auth)
  const { actividades, loading: actividadesLoading, error: actividadesError } = useSelector((state) => state.actividades)
  const { pedidos, loading: pedidosLoading, error: pedidosError } = useSelector((state) => state.pedidos)
  
  // Filtrar pedidos del cliente actual
  const clientePedidos = pedidos?.filter(pedido => pedido.cliente_id === userInfo?.id) || []
  
  useEffect(() => {
    dispatch(fetchActividades())
    dispatch(getPedidos())
  }, [dispatch])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Bienvenido, {userInfo?.nombre_usuario}</h2>
      
      {/* Resumen de pedidos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Mis Pedidos Recientes</h3>
        
        {pedidosLoading ? (
          <Loader />
        ) : pedidosError ? (
          <Message variant="error">{pedidosError}</Message>
        ) : clientePedidos.length === 0 ? (
          <p className="text-gray-500">No tienes pedidos realizados aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientePedidos.slice(0, 5).map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{pedido.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pedido.actividad?.nombre || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pedido.fecha_pedido).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        pedido.estado === 'completado' ? 'bg-green-100 text-green-800' :
                        pedido.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${pedido.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/cliente/pedidos/${pedido.id}`} className="text-primary-600 hover:text-primary-900">
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {clientePedidos.length > 5 && (
              <div className="mt-4 text-right">
                <Link to="/cliente/pedidos" className="text-primary-600 hover:text-primary-900 text-sm font-medium">
                  Ver todos los pedidos
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Actividades disponibles */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actividades Disponibles</h3>
        
        {actividadesLoading ? (
          <Loader />
        ) : actividadesError ? (
          <Message variant="error">{actividadesError}</Message>
        ) : actividades.length === 0 ? (
          <p className="text-gray-500">No hay actividades disponibles en este momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actividades.slice(0, 3).map((actividad) => (
              <div key={actividad.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-1">{actividad.nombre}</h4>
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(actividad.fecha).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{actividad.descripcion}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-600 font-medium">${actividad.precio.toFixed(2)}</span>
                    <Link 
                      to={`/actividades/${actividad.id}`} 
                      className="text-sm bg-primary-600 hover:bg-primary-700 text-white py-1 px-3 rounded"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 text-right">
          <Link to="/" className="text-primary-600 hover:text-primary-900 text-sm font-medium">
            Ver todas las actividades
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard