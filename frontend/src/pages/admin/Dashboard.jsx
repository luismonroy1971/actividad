import React, { useEffect, useState } from 'react'
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
  
  const [estadisticas, setEstadisticas] = useState({
    totalActividades: 0,
    actividadesProximas: 0,
    totalPedidos: 0,
    pedidosPendientes: 0,
    ingresoTotal: 0
  })

  useEffect(() => {
    dispatch(fetchActividades())
    dispatch(getPedidos())
  }, [dispatch])

  useEffect(() => {
    if (actividades && pedidos) {
      // Calcular estadísticas
      const fechaActual = new Date()
      const actividadesProximas = actividades.filter(act => 
        act && act.fecha_actividad && new Date(act.fecha_actividad) > fechaActual
      )
      
      const pedidosPendientes = pedidos.filter(ped => 
        ped && ped.estado === 'pendiente'
      )
      
      // Añadir comprobación para evitar error si algún pedido no tiene propiedad total
      const ingresoTotal = pedidos.reduce((total, pedido) => {
        const pedidoTotal = pedido && pedido.total ? Number(pedido.total) : 0
        return total + pedidoTotal
      }, 0)

      setEstadisticas({
        totalActividades: Array.isArray(actividades) ? actividades.length : 0,
        actividadesProximas: actividadesProximas.length,
        totalPedidos: Array.isArray(pedidos) ? pedidos.length : 0,
        pedidosPendientes: pedidosPendientes.length,
        ingresoTotal
      })
    }
  }, [actividades, pedidos])

  // Función de ayuda para formatear fechas de manera segura
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // Extraer directamente del string ISO para evitar problemas de zona horaria
      if (dateString.includes('T')) {
        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Si es un formato simple como '2025-05-01'
      if (dateString.includes('-') && dateString.split('-').length === 3) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Último recurso: crear fecha y formatear manualmente
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'N/A';
    }
  };
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Panel de Administración</h2>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Actividades</h3>
              <div className="mt-1 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{estadisticas.totalActividades}</p>
                <p className="ml-2 text-sm text-gray-600">
                  ({estadisticas.actividadesProximas} próximas)
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/actividades" className="text-sm font-medium text-primary-600 hover:text-primary-800">
              Ver todas las actividades →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Pedidos</h3>
              <div className="mt-1 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{estadisticas.totalPedidos}</p>
                <p className="ml-2 text-sm text-gray-600">
                  ({estadisticas.pedidosPendientes} pendientes)
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/pedidos" className="text-sm font-medium text-primary-600 hover:text-primary-800">
              Ver todos los pedidos →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Ingresos</h3>
              <div className="mt-1">
                <p className="text-2xl font-semibold text-gray-900">${estadisticas.ingresoTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actividades recientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Actividades Recientes</h3>
        </div>
        
        {actividadesLoading ? (
          <div className="p-6"><Loader /></div>
        ) : actividadesError ? (
          <div className="p-6"><Message variant="error">{actividadesError}</Message></div>
        ) : !actividades || actividades.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No hay actividades disponibles</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {actividades.slice(0, 5).map((actividad) => (
                  <tr key={actividad._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {actividad?.titulo || 'Sin título'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(actividad?.fecha_actividad)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {actividad?.lugar || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${actividad?.precio ? Number(actividad.precio).toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/admin/actividades/editar/${actividad._id}`} className="text-primary-600 hover:text-primary-900 mr-4">
                        Editar
                      </Link>
                      <Link to={`/actividades/${actividad._id}`} className="text-gray-600 hover:text-gray-900">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Link to="/admin/actividades" className="text-sm font-medium text-primary-600 hover:text-primary-800">
            Ver todas las actividades
          </Link>
        </div>
      </div>
      
      {/* Pedidos recientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pedidos Recientes</h3>
        </div>
        
        {pedidosLoading ? (
          <div className="p-6"><Loader /></div>
        ) : pedidosError ? (
          <div className="p-6"><Message variant="error">{pedidosError}</Message></div>
        ) : !pedidos || pedidos.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No hay pedidos disponibles</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pedidos.slice(0, 5).map((pedido) => (
                  <tr key={pedido?._id || pedido?.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{pedido?._id || pedido?.id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pedido?.cliente?.nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pedido?.actividad?.titulo || pedido?.actividad?.nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(pedido?.fecha_pedido)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pedido?.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        pedido?.estado === 'completado' ? 'bg-green-100 text-green-800' :
                        pedido?.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {pedido?.estado ? (pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${pedido?.total ? Number(pedido.total).toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/admin/pedidos/${pedido?._id || pedido?.id}`} className="text-primary-600 hover:text-primary-900">
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Link to="/admin/pedidos" className="text-sm font-medium text-primary-600 hover:text-primary-800">
            Ver todos los pedidos
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard