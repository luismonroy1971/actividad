import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchActividades } from '../../store/slices/actividadSlice'
import { getPedidos } from '../../store/slices/pedidoSlice'
import { getClientePedidos } from '../../store/slices/pedidoSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import formatDate from '../../utils/dateFormatter'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { userInfo } = useSelector((state) => state.auth)
  const { actividades, loading: actividadesLoading, error: actividadesError } = useSelector((state) => state.actividades)
  const { pedidos = [], loading: pedidosLoading, error: pedidosError } = useSelector((state) => state.pedido || {})
  
  // Filtrar pedidos del cliente actual
  const clientePedidos = pedidos?.filter(pedido => {
    // Comparar como strings para mayor seguridad
    const pedidoClienteId = pedido.cliente_id?._id || pedido.cliente_id;
    const userClienteId = userInfo?.cliente_id || userInfo?.id;
    
    return pedidoClienteId && userClienteId && 
           String(pedidoClienteId) === String(userClienteId);
  }) || []
  
  useEffect(() => {
    dispatch(fetchActividades())
    dispatch(getClientePedidos())
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
                      {formatDate(pedido.fecha_pedido)}
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
              <div key={actividad.id || actividad._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Imagen de la actividad */}
                <div className="h-40 bg-gray-200 overflow-hidden">
                  {actividad.imagen_promocional && actividad.imagen_promocional !== 'no-photo.jpg' ? (
                    <img 
                      src={`/uploads/actividades/${actividad.imagen_promocional}`} 
                      alt={actividad.nombre || actividad.titulo} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=Imagen+no+disponible';
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-1">{actividad.nombre || actividad.titulo}</h4>
                  <p className="text-sm text-gray-500 mb-2">
                    {formatDate(actividad.fecha || actividad.fecha_actividad)}
                  </p>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{actividad.descripcion}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-600 font-medium">${Number(actividad.precio).toFixed(2)}</span>
                    <Link 
                      to={`/actividades/${actividad.id || actividad._id}`} 
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